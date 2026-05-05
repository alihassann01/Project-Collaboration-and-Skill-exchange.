<?php
/**
 * Simple pattern-matching router.
 * Routes are tried in declaration order; first match wins.
 * Route params captured as named matches become $params array.
 */
class Router
{
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        // Convert {param} to named capture groups
        $regex = preg_replace('/\{([a-z_]+)\}/', '(?P<$1>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#';
        $this->routes[] = compact('method', 'pattern', 'regex', 'handler');
    }

    public function dispatch(string $method, string $path): void
    {
        // Support method override via _method hidden field
        if ($method === 'POST' && !empty($_POST['_method'])) {
            $method = strtoupper($_POST['_method']);
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method && $route['method'] !== 'ANY') continue;
            if (!preg_match($route['regex'], $path, $matches)) continue;

            // Extract named params
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            ($route['handler'])($params);
            return;
        }

        abort(404, 'Page not found.');
    }
}
