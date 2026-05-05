<?php

class SkillSwapController
{
    // GET /api/skill-swap
    public function index(): void
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated.', 401);
        }

        $userId = Auth::id();

        // My listings — join users to get user_name
        $myListings = DB::query(
            'SELECT ss.*, u.name AS user_name
             FROM skill_swaps ss
             JOIN users u ON ss.user_id = u.id
             WHERE ss.user_id = ?
             ORDER BY ss.created_at DESC',
            [$userId]
        );
        foreach ($myListings as $row) {
            $row->is_active = ($row->status === 'active');
        }

        // Other listings — active only, not mine
        $otherListings = DB::query(
            'SELECT ss.*, u.name AS user_name
             FROM skill_swaps ss
             JOIN users u ON ss.user_id = u.id
             WHERE ss.status = "active" AND ss.user_id != ?
             ORDER BY ss.created_at DESC',
            [$userId]
        );
        foreach ($otherListings as $row) {
            $row->is_active = true;
        }

        // Incoming requests — people requesting MY listings
        $incomingRequests = DB::query(
            'SELECT sr.id, sr.swap_id, sr.status, sr.created_at,
                    ss.teach_skill, ss.learn_skill,
                    u.name AS requester_name
             FROM swap_requests sr
             JOIN skill_swaps ss ON sr.swap_id = ss.id
             JOIN users u ON sr.from_user_id = u.id
             WHERE sr.to_user_id = ?
             ORDER BY sr.created_at DESC',
            [$userId]
        );

        // Outgoing requests — requests I sent to others
        $outgoingRequests = DB::query(
            'SELECT sr.id, sr.swap_id, sr.status, sr.created_at,
                    ss.teach_skill, ss.learn_skill,
                    u.name AS owner_name
             FROM swap_requests sr
             JOIN skill_swaps ss ON sr.swap_id = ss.id
             JOIN users u ON ss.user_id = u.id
             WHERE sr.from_user_id = ?
             ORDER BY sr.created_at DESC',
            [$userId]
        );

        Response::success([
            'my_listings'       => $myListings,
            'other_listings'    => $otherListings,
            'incoming_requests' => $incomingRequests,
            'outgoing_requests' => $outgoingRequests,
        ]);
    }

    // POST /api/skill-swap
    public function store(): void
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated.', 401);
        }

        $body       = json_decode(file_get_contents('php://input'), true) ?? [];
        $teachSkill = trim($body['teach_skill'] ?? '');
        $learnSkill = trim($body['learn_skill'] ?? '');

        if ($teachSkill === '' || $learnSkill === '') {
            Response::error('Both teach_skill and learn_skill are required.', 422, [
                'teach_skill' => $teachSkill === '' ? 'This field is required.' : null,
                'learn_skill' => $learnSkill === '' ? 'This field is required.' : null,
            ]);
        }

        $newId = DB::insert(
            'INSERT INTO skill_swaps (user_id, teach_skill, learn_skill, status, created_at, updated_at)
             VALUES (?, ?, ?, "active", NOW(), NOW())',
            [Auth::id(), $teachSkill, $learnSkill]
        );

        $newListing = DB::queryOne(
            'SELECT ss.*, u.name AS user_name
             FROM skill_swaps ss
             JOIN users u ON ss.user_id = u.id
             WHERE ss.id = ?',
            [$newId]
        );
        $newListing->is_active = true;

        Response::success($newListing, 'Listing created.', 201);
    }

    // POST /api/skill-swap/{id}/request
    public function sendRequest(int $swapId): void
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated.', 401);
        }

        $swap = DB::queryOne(
            'SELECT * FROM skill_swaps WHERE id = ? AND status = "active"',
            [$swapId]
        );

        if (!$swap || (int)$swap->user_id === Auth::id()) {
            Response::error('Swap not found, not active, or you cannot request your own listing.', 400);
        }

        $existing = DB::scalar(
            'SELECT COUNT(*) FROM swap_requests WHERE from_user_id = ? AND swap_id = ? AND status = "pending"',
            [Auth::id(), $swapId]
        );
        if ($existing) {
            Response::error('You already have a pending request for this swap.', 400);
        }

        DB::insert(
            'INSERT INTO swap_requests (from_user_id, to_user_id, swap_id, status, created_at)
             VALUES (?, ?, ?, "pending", NOW())',
            [Auth::id(), $swap->user_id, $swapId]
        );

        Response::success([], 'Request sent.');
    }

    // PATCH /api/skill-swap/requests/{id}/respond
    public function respondRequest(int $reqId): void
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated.', 401);
        }

        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = trim($body['status'] ?? '');

        if (!in_array($status, ['accepted', 'rejected'], true)) {
            Response::error('Status must be "accepted" or "rejected".', 422);
        }

        $req = DB::queryOne(
            'SELECT * FROM swap_requests WHERE id = ? AND to_user_id = ?',
            [$reqId, Auth::id()]
        );
        if (!$req) {
            Response::error('Request not found or not authorized.', 403);
        }

        DB::execute(
            'UPDATE swap_requests SET status = ?, updated_at = NOW() WHERE id = ?',
            [$status, $reqId]
        );

        Response::success([], 'Response recorded.');
    }

    // PATCH /api/skill-swap/{id}/toggle
    public function toggle(int $id): void
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated.', 401);
        }

        $swap = DB::queryOne(
            'SELECT * FROM skill_swaps WHERE id = ? AND user_id = ?',
            [$id, Auth::id()]
        );
        if (!$swap) {
            Response::error('Listing not found or not authorized.', 403);
        }

        $newStatus = $swap->status === 'active' ? 'inactive' : 'active';
        DB::execute(
            'UPDATE skill_swaps SET status = ?, updated_at = NOW() WHERE id = ?',
            [$newStatus, $id]
        );

        Response::success(['is_active' => $newStatus === 'active'], 'Status updated.');
    }

    // DELETE /api/skill-swap/{id}
    public function destroy(int $id): void
    {
        if (!Auth::check()) {
            Response::error('Unauthenticated.', 401);
        }

        $swap = DB::queryOne(
            'SELECT * FROM skill_swaps WHERE id = ? AND user_id = ?',
            [$id, Auth::id()]
        );
        if (!$swap) {
            Response::error('Listing not found or not authorized.', 403);
        }

        DB::execute('DELETE FROM skill_swaps WHERE id = ?', [$id]);

        Response::success([], 'Listing deleted.');
    }
}
