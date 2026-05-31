<?php
/**
 * Fix 3: Simple file-based IP rate limiter for login brute-force protection.
 * Stores timestamps of failed attempts per key in JSON files under storage/rate_limits/.
 */
class RateLimiter
{
    private static string $dir = '';

    private static function ensureDir(): void
    {
        if (self::$dir === '') {
            self::$dir = APP_PATH . '/storage/rate_limits';
        }
        if (!is_dir(self::$dir)) {
            mkdir(self::$dir, 0755, true);
        }
    }

    private static function filePath(string $key): string
    {
        self::ensureDir();
        return self::$dir . '/' . md5($key) . '.json';
    }

    private static function loadAttempts(string $file, int $windowSeconds): array
    {
        if (!file_exists($file)) return [];
        $data = json_decode(file_get_contents($file), true);
        if (!is_array($data)) return [];
        $cutoff = time() - $windowSeconds;
        return array_values(array_filter($data, fn(int $t) => $t > $cutoff));
    }

    /** Check if the key has exceeded the maximum number of attempts within the decay window. */
    public static function tooManyAttempts(string $key, int $maxAttempts, int $decayMinutes): bool
    {
        $file     = self::filePath($key);
        $attempts = self::loadAttempts($file, $decayMinutes * 60);
        return count($attempts) >= $maxAttempts;
    }

    /** Record a failed attempt for the given key. */
    public static function hit(string $key, int $decayMinutes): void
    {
        $file     = self::filePath($key);
        $attempts = self::loadAttempts($file, $decayMinutes * 60);
        $attempts[] = time();
        file_put_contents($file, json_encode($attempts), LOCK_EX);
    }

    /** Clear all attempts for the given key (e.g. on successful login). */
    public static function clear(string $key): void
    {
        $file = self::filePath($key);
        if (file_exists($file)) @unlink($file);
    }

    /** Return the number of seconds until the rate limit resets. */
    public static function availableIn(string $key, int $decayMinutes): int
    {
        $file     = self::filePath($key);
        $attempts = self::loadAttempts($file, $decayMinutes * 60);
        if (empty($attempts)) return 0;
        $oldest    = min($attempts);
        $unlocksAt = $oldest + ($decayMinutes * 60);
        return max(0, $unlocksAt - time());
    }
}
