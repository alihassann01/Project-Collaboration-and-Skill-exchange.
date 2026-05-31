<?php

class RatingController
{
    /**
     * POST /api/ratings/{toUserId}/{projectId}  (auth required)
     * POST /api/ratings/{toUserId}              (swap rating — no project)
     *
     * Fix 1: project_id is nullable. When 0 or null is received (swap rating),
     * it is stored as NULL in the database instead of 0, avoiding the FK violation.
     */
    public function store(int $toUserId, ?int $projectId = null): void
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated.', 401);
            return;
        }

        $fromUserId = Auth::id();

        // Normalize: treat 0 as null (swap rating, no project involved)
        if ($projectId === 0) {
            $projectId = null;
        }

        if ($fromUserId === $toUserId) {
            Response::error('You cannot rate yourself.', 422);
            return;
        }

        $body  = json_decode(file_get_contents('php://input'), true) ?? [];
        $score = isset($body['score']) ? (int)$body['score'] : 0;

        if ($score < 1 || $score > 5) {
            Response::error('Validation failed.', 422, ['score' => 'Score must be an integer between 1 and 5.']);
            return;
        }

        $review = isset($body['review']) ? trim($body['review']) : null;
        if ($review === '') $review = null;

        // Duplicate check — must handle NULL project_id with IS NULL
        if ($projectId !== null) {
            $existing = (int)DB::scalar(
                'SELECT COUNT(*) FROM ratings WHERE from_user_id = ? AND to_user_id = ? AND project_id = ?',
                [$fromUserId, $toUserId, $projectId]
            );
        } else {
            $existing = (int)DB::scalar(
                'SELECT COUNT(*) FROM ratings WHERE from_user_id = ? AND to_user_id = ? AND project_id IS NULL',
                [$fromUserId, $toUserId]
            );
        }
        if ($existing > 0) {
            Response::error('You have already reviewed this user for this project.', 409);
            return;
        }

        // Project completion guard — only enforced when a real project_id is supplied.
        // null project_id means the rating comes from a skill swap (no project involved).
        if ($projectId !== null) {
            $project = DB::queryOne('SELECT id, status FROM projects WHERE id = ?', [$projectId]);
            if (!$project) {
                Response::error('Project not found.', 404);
                return;
            }
            if ($project->status !== 'completed') {
                Response::error('Ratings can only be given after the project is marked as completed.', 403);
                return;
            }
        }

        // Verify real connection: approved application on project involving both users, OR accepted swap
        if ($projectId !== null) {
            $appConnection = (int)DB::scalar(
                "SELECT COUNT(*) FROM applications a
                 JOIN projects p ON p.id = a.project_id
                 WHERE a.project_id = ? AND a.status = 'approved'
                   AND (
                     (a.student_id = ? AND p.employer_id = ?)
                     OR
                     (a.student_id = ? AND p.employer_id = ?)
                   )",
                [$projectId, $fromUserId, $toUserId, $toUserId, $fromUserId]
            );
        } else {
            $appConnection = 0;
        }

        $swapConnection = (int)DB::scalar(
            "SELECT COUNT(*) FROM swap_requests sr
             JOIN skill_swaps sl ON sl.id = sr.swap_id
             WHERE sr.status = 'accepted'
               AND ((sr.from_user_id = ? AND sl.user_id = ?)
                 OR (sr.from_user_id = ? AND sl.user_id = ?))",
            [$fromUserId, $toUserId, $toUserId, $fromUserId]
        );

        if ($appConnection === 0 && $swapConnection === 0) {
            Response::error('You can only rate users you have worked with via an approved project or accepted skill swap.', 403);
            return;
        }

        DB::execute(
            'INSERT INTO ratings (from_user_id, to_user_id, project_id, score, review, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())',
            [$fromUserId, $toUserId, $projectId, $score, $review]
        );

        $newRating = DB::queryOne(
            $projectId !== null
                ? 'SELECT * FROM ratings WHERE from_user_id = ? AND to_user_id = ? AND project_id = ? ORDER BY id DESC LIMIT 1'
                : 'SELECT * FROM ratings WHERE from_user_id = ? AND to_user_id = ? AND project_id IS NULL ORDER BY id DESC LIMIT 1',
            $projectId !== null
                ? [$fromUserId, $toUserId, $projectId]
                : [$fromUserId, $toUserId]
        );

        // Notification
        $from = Auth::user();
        $notifBody = $projectId !== null
            ? $from->name . ' left you a ' . $score . '-star review for project #' . $projectId
            : $from->name . ' left you a ' . $score . '-star review from a skill swap';

        DB::execute(
            'INSERT INTO notifications (user_id, type, title, body, link, is_read, created_at)
             VALUES (?, "rating", "New Review Received ⭐", ?, ?, 0, NOW())',
            [
                $toUserId,
                $notifBody,
                '/profile/' . $toUserId,
            ]
        );

        Response::success(['rating' => $newRating], 'Rating submitted.');
    }

    // GET /api/ratings/{userId}  (public)
    public function getUserRatings(int $userId): void
    {
        $ratings = DB::query(
            "SELECT r.score, r.review, r.created_at,
                    u.name  AS from_user_name,
                    p.title AS project_title
             FROM ratings r
             JOIN users    u ON u.id = r.from_user_id
             LEFT JOIN projects p ON p.id = r.project_id
             WHERE r.to_user_id = ?
             ORDER BY r.created_at DESC",
            [$userId]
        );

        $total = count($ratings);
        $avg   = $total > 0
            ? round(array_sum(array_map(fn($r) => $r->score, $ratings)) / $total, 2)
            : 0.00;

        Response::success([
            'ratings'       => $ratings,
            'average_score' => $avg,
            'total'         => $total,
        ]);
    }
}
