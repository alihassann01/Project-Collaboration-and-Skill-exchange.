<?php
class DB
{
    private static ?PDO $pdo = null;

    public static function connect(): PDO
    {
        if (self::$pdo !== null) return self::$pdo;

        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        try {
            self::$pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            die('Database connection failed: ' . $e->getMessage());
        }
        return self::$pdo;
    }

    /** Run a SELECT, returns array of stdClass objects */
    public static function query(string $sql, array $params = []): array
    {
        $stmt = self::connect()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /** Run a SELECT, returns single stdClass or null */
    public static function queryOne(string $sql, array $params = []): ?object
    {
        $stmt = self::connect()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /** Run INSERT/UPDATE/DELETE, returns number of affected rows */
    public static function execute(string $sql, array $params = []): int
    {
        $stmt = self::connect()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /** Run INSERT and return last insert ID */
    public static function insert(string $sql, array $params = []): int
    {
        $stmt = self::connect()->prepare($sql);
        $stmt->execute($params);
        return (int) self::connect()->lastInsertId();
    }

    /** Fetch single scalar value */
    public static function scalar(string $sql, array $params = []): mixed
    {
        $stmt = self::connect()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }

    /** Paginate a query. Returns Paginator object. */
    public static function paginate(string $sql, array $params, int $perPage = 20,
                                    string $countSql = ''): Paginator
    {
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $offset = ($page - 1) * $perPage;

        if (!$countSql) {
            // wrap in subquery for count
            $countSql = "SELECT COUNT(*) FROM ($sql) AS _count_sub";
        }
        $total = (int) self::scalar($countSql, $params);

        $pageSql = $sql . " LIMIT $perPage OFFSET $offset";
        $items   = self::query($pageSql, $params);

        return new Paginator($items, $total, $perPage, $page);
    }

    public static function pdo(): PDO
    {
        return self::connect();
    }
}
