<?php

class MessageController
{
    private function getConversationsList(): array
    {
        return DB::query(
            'SELECT c.id, c.last_message_at,
                    CASE WHEN c.user_one_id = :uid THEN c.user_two_id ELSE c.user_one_id END AS other_user_id,
                    CASE WHEN c.user_one_id = :uid THEN u2.name ELSE u1.name END AS other_user_name,
                    CASE WHEN c.user_one_id = :uid THEN u2.avatar ELSE u1.avatar END AS other_user_avatar,
                    (SELECT m.body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
                    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != :uid AND m.is_read = 0) AS unread_count
             FROM conversations c
             JOIN users u1 ON c.user_one_id = u1.id
             JOIN users u2 ON c.user_two_id = u2.id
             WHERE c.user_one_id = :uid OR c.user_two_id = :uid
             ORDER BY COALESCE(c.last_message_at, c.created_at) DESC',
            [':uid' => Auth::id()]
        );
    }

    // GET /api/messages
    public function index(): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }
        $conversations = $this->getConversationsList();
        Response::success(['conversations' => $conversations]);
    }

    // GET /api/messages/{id}
    public function show(int $convId): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        $conversation = DB::queryOne(
            'SELECT * FROM conversations WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)',
            [$convId, Auth::id(), Auth::id()]
        );
        if (!$conversation) {
            Response::error('Forbidden: you are not a participant in this conversation.', 403);
            return;
        }

        $otherId = $conversation->user_one_id === Auth::id()
            ? $conversation->user_two_id
            : $conversation->user_one_id;

        $other = DB::queryOne(
            'SELECT id, name, avatar, role, headline FROM users WHERE id = ?',
            [$otherId]
        );

        $messages = DB::query(
            'SELECT id, sender_id, body, is_read, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
            [$convId]
        );

        DB::execute(
            'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ? AND is_read = 0',
            [$convId, Auth::id()]
        );

        Response::success([
            'messages'        => $messages,
            'other_user'      => $other,
            'conversation_id' => $convId,
        ]);
    }

    // POST /api/messages/{id}
    public function send(int $convId): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        $conversation = DB::queryOne(
            'SELECT * FROM conversations WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)',
            [$convId, Auth::id(), Auth::id()]
        );
        if (!$conversation) {
            Response::error('Forbidden: you are not a participant in this conversation.', 403);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $body  = trim($input['body'] ?? '');

        if ($body === '') {
            Response::error('Message body cannot be empty.', 422);
            return;
        }

        DB::execute(
            'INSERT INTO messages (conversation_id, sender_id, body, is_read, created_at) VALUES (?, ?, ?, 0, NOW())',
            [$convId, Auth::id(), $body]
        );
        $newId = DB::scalar('SELECT LAST_INSERT_ID()');
        DB::execute(
            'UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = ?',
            [$convId]
        );

        $otherId = $conversation->user_one_id === Auth::id()
            ? $conversation->user_two_id
            : $conversation->user_one_id;

        $sender = Auth::user();
        DB::execute(
            'INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
             VALUES (?, "message", ?, ?, ?, 0, NOW())',
            [
                $otherId,
                'New message from ' . $sender->name,
                $sender->name . ': ' . mb_substr($body, 0, 80),
                '/messages/' . $convId,
            ]
        );

        $newMsg = DB::queryOne('SELECT * FROM messages WHERE id = ?', [$newId]);
        Response::success(['message' => $newMsg], 'Message sent.', 201);
    }

    // POST /api/messages/start
    public function startConversation(): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        $input  = json_decode(file_get_contents('php://input'), true) ?? [];
        $userId = isset($input['user_id']) ? (int)$input['user_id'] : 0;

        if ($userId <= 0) {
            Response::error('user_id is required.', 422);
            return;
        }

        $me = Auth::id();

        if ($me === $userId) {
            Response::error('You cannot start a conversation with yourself.', 422);
            return;
        }

        // Check target user exists
        $target = DB::queryOne('SELECT id, name FROM users WHERE id = ?', [$userId]);
        if (!$target) {
            Response::error('User not found.', 404);
            return;
        }

        // Check if conversation already exists (either direction)
        $existing = DB::queryOne(
            'SELECT id FROM conversations WHERE (user_one_id = ? AND user_two_id = ?) OR (user_one_id = ? AND user_two_id = ?)',
            [$me, $userId, $userId, $me]
        );

        if ($existing) {
            Response::success(['conversation_id' => (int)$existing->id], 'Conversation already exists.');
            return;
        }

        // Create new conversation — user_one_id is always the smaller id to maintain the UNIQUE constraint
        $one = min($me, $userId);
        $two = max($me, $userId);

        DB::execute(
            'INSERT INTO conversations (user_one_id, user_two_id, created_at) VALUES (?, ?, NOW())',
            [$one, $two]
        );
        $convId = (int)DB::scalar('SELECT LAST_INSERT_ID()');

        Response::success(['conversation_id' => $convId], 'Conversation created.', 201);
    }
}
