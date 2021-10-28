<?php

namespace App\Helpers\RouteGenerator;

use Illuminate\Routing\Router;

class RouteGenerator
{
	private $baseDomain;
	private $basePort;
	private $baseUrl;
	private $baseProtocol;
	private $router;

	/**
	 * RouteGenerator constructor.
	 * @param Router $router
	 */
	public function __construct(Router $router)
	{
		$this->baseUrl = url()->to('/');
		$parsedUrl = parse_url($this->baseUrl);
		$this->basePort =  $parsedUrl['port'] ?? 'false';
		$this->baseProtocol = $parsedUrl['scheme'] ?? 'http';
		$this->baseDomain = $parsedUrl['host'] ?? '';
		$this->router = $router;
	}

	/**
	 * Get routes payload
	 *
	 * @param bool $group
	 * @return \Illuminate\Support\Collection
	 */
	private function getRoutePayload($group = false)
	{
		return RoutePayload::compile($this->router, $group);
	}

	/**
	 * @param bool $group
	 * @return array
	 */
	public function generate($group = false)
	{
		$namedRoutes = $this->getRoutePayload($group);
		$defaultParameters = app('url')->getDefaultParameters();

		return [
			'namedRoutes'       => $namedRoutes,
			'baseUrl'           => $this->baseUrl,
			'baseProtocol'      => $this->baseProtocol,
			'baseDomain'        => $this->baseDomain,
			'basePort'          => $this->basePort,
			'defaultParameters' => $defaultParameters
		];
	}
}
