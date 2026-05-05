<?php
class Paginator
{
    public array  $items;
    public int    $total;
    public int    $perPage;
    public int    $currentPage;
    public int    $lastPage;

    public function __construct(array $items, int $total, int $perPage, int $currentPage)
    {
        $this->items       = $items;
        $this->total       = $total;
        $this->perPage     = $perPage;
        $this->currentPage = $currentPage;
        $this->lastPage    = max(1, (int)ceil($total / $perPage));
    }

    public function count(): int { return count($this->items); }
    public function total(): int { return $this->total; }

    /** Render Bootstrap-compatible pagination links */
    public function links(): string
    {
        if ($this->lastPage <= 1) return '';

        // Preserve existing query params
        $params = $_GET;
        $html   = '<div class="pagination">';

        // Previous
        if ($this->currentPage > 1) {
            $params['page'] = $this->currentPage - 1;
            $html .= '<a class="page-btn" href="?' . http_build_query($params) . '">← Prev</a>';
        } else {
            $html .= '<span class="page-btn disabled">← Prev</span>';
        }

        // Page numbers (show at most 7)
        $start = max(1, $this->currentPage - 3);
        $end   = min($this->lastPage, $this->currentPage + 3);

        if ($start > 1) {
            $params['page'] = 1;
            $html .= '<a class="page-btn" href="?' . http_build_query($params) . '">1</a>';
            if ($start > 2) $html .= '<span class="page-btn disabled">…</span>';
        }

        for ($i = $start; $i <= $end; $i++) {
            $params['page'] = $i;
            $active = ($i === $this->currentPage) ? ' active' : '';
            $html  .= '<a class="page-btn' . $active . '" href="?' . http_build_query($params) . '">' . $i . '</a>';
        }

        if ($end < $this->lastPage) {
            if ($end < $this->lastPage - 1) $html .= '<span class="page-btn disabled">…</span>';
            $params['page'] = $this->lastPage;
            $html .= '<a class="page-btn" href="?' . http_build_query($params) . '">' . $this->lastPage . '</a>';
        }

        // Next
        if ($this->currentPage < $this->lastPage) {
            $params['page'] = $this->currentPage + 1;
            $html .= '<a class="page-btn" href="?' . http_build_query($params) . '">Next →</a>';
        } else {
            $html .= '<span class="page-btn disabled">Next →</span>';
        }

        $html .= '</div>';
        return $html;
    }
}
