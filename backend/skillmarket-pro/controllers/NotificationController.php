<?php

class NotificationController
{
    // GET /api/notifications
    public function index(): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        $items = DB::query(
            'SELECT id, type, title, body, link, is_read, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 50',
            [Auth::id()]
        );

        $unread = (int) DB::scalar(
            'SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0',
            [Auth::id()]
        );

        Response::success(['notifications' => $items, 'unread_count' => $unread]);
    }

    // GET /api/notifications/unread-count
    public function unreadCount(): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        $count = (int) DB::scalar(
            'SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0',
            [Auth::id()]
        );

        Response::success(['unread_count' => $count]);
    }

    // POST /api/notifications/{id}/read
    public function markRead(int $id): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        DB::execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [$id, Auth::id()]
        );

        Response::success([], 'Marked as read.');
    }

    // POST /api/notifications/mark-all-read
    public function markAllRead(): void
    {
        if (!Auth::check()) { Response::error('Unauthenticated.', 401); return; }

        DB::execute(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [Auth::id()]
        );

        Response::success([], 'All marked as read.');
    }
}
