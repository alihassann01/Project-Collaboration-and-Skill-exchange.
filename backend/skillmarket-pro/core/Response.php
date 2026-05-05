<?php

class Response
{
    /**
     * Send a raw JSON response.
     */
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send a standardised success envelope.
     * { success: true, message: "...", data: {...} }
     */
    public static function success(mixed $data = [], string $message = 'Success', int $status = 200): never
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Send a standardised error envelope.
     * { success: false, message: "...", errors: {...} }
     */
    public static function error(string $message = 'Error', int $status = 400, array $errors = []): never
    {
        self::json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }
}
