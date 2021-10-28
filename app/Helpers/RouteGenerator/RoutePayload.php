<?php

namespace App\Helpers\RouteGenerator;

use Illuminate\Routing\Router;

class RoutePayload
{
	/**
	 * @var \Illuminate\Support\Collection
	 */
    protected $routes;

	/**
	 * @var Router
	 */
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
        $this->routes = $this->nameKeyedRoutes();
    }

	/**
	 * @param Router $router
	 * @param bool $group
	 * @return \Illuminate\Support\Collection
	 */
    public static function compile(Router $router, $group = false)
    {
        return (new static($router))->applyFilters($group);
    }

	/**
	 * @param $group
	 * @return \Illuminate\Support\Collection
	 */
    public function applyFilters($group)
    {
        if ($group) {
            return $this->group($group);
        }

        // return unfiltered routes if user set both config options.
        if (config()->has('ziggy.blacklist') && config()->has('ziggy.whitelist')) {
            return $this->routes;
        }

        if (config()->has('ziggy.blacklist')) {
            return $this->blacklist();
        }

        if (config()->has('ziggy.whitelist')) {
            return $this->whitelist();
        }

        return $this->routes;
    }

	/**
	 * @param $group
	 * @return \Illuminate\Support\Collection
	 */
    public function group($group)
    {
        if(is_array($group)) {
            $filters = [];
            foreach($group as $groupName) {
              $filters = array_merge($filters, config("ziggy.groups.{$groupName}"));
            }

            return is_array($filters)? $this->filter($filters, true) : $this->routes;
        }
        else if(config()->has("ziggy.groups.{$group}")) {
            return $this->filter(config("ziggy.groups.{$group}"), true);
        }
        
        return $this->routes;
    }

	/**
	 * @return \Illuminate\Support\Collection
	 */
    public function blacklist()
    {
        return $this->filter(config('ziggy.blacklist'), false);
    }

	/**
	 * @return \Illuminate\Support\Collection
	 */
    public function whitelist()
    {
        return $this->filter(config('ziggy.whitelist'), true);
    }

	/**
	 * @param array $filters
	 * @param bool $include
	 * @return \Illuminate\Support\Collection
	 */
    public function filter($filters = [], $include = true)
    {
        return $this->routes->filter(function ($route, $name) use ($filters, $include) {
            foreach ($filters as $filter) {
                if (str_is($filter, $name)) {
                    return $include;
                }
            }

            return ! $include;
        });
    }

	/**
	 * @return \Illuminate\Support\Collection
	 */
    protected function nameKeyedRoutes()
    {
        return collect($this->router->getRoutes()->getRoutesByName())
            ->map(function ($route) {
                if ($this->isListedAs($route, 'blacklist')) {
                    $this->appendRouteToList($route->getName(), 'blacklist');
                } elseif ($this->isListedAs($route, 'whitelist')) {
                    $this->appendRouteToList($route->getName(), 'whitelist');
                }

                return collect($route)->only(['uri', 'methods'])
                    ->put('domain', $route->domain())
                    ->when($middleware = config('ziggy.middleware'), function ($collection) use ($middleware, $route) {
                        if (is_array($middleware)) {
                            return $collection->put('middleware', collect($route->middleware())->intersect($middleware)->values());
                        }

                        return $collection->put('middleware', $route->middleware());
                    });
            });
    }

	/**
	 * @param $name
	 * @param $list
	 */
    protected function appendRouteToList($name, $list)
    {
        config()->push("ziggy.{$list}", $name);
    }

	/**
	 * @param $route
	 * @param $list
	 * @return bool
	 */
    protected function isListedAs($route, $list)
    {
        return (isset($route->listedAs) && $route->listedAs === $list)
            || array_get($route->getAction(), 'listed_as', null) === $list;
    }
}
