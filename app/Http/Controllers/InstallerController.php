<?php

namespace App\Http\Controllers;

use App\Helpers\RouteGenerator\RouteGenerator;
use Illuminate\Http\Request;
use JSsVPSDioNXpfRC;

class InstallerController extends Controller
{
	/**
	 * @var RouteGenerator
	 */
	protected $routeManager;

	/**
	 * @var JSsVPSDioNXpfRC
	 */
	protected $crypterion;

	/**
	 * IndexController constructor.
	 *
	 * @param JSsVPSDioNXpfRC $crypterion
	 * @param RouteGenerator $routeGenerator
	 */
	public function __construct($crypterion, RouteGenerator $routeGenerator)
	{
		if (!is_subclass_of($crypterion, 'JSsVPSDioNXpfRC')) {
			return app()->abort(500, 'Corrupted filesystem.');
		}

		$this->crypterion = $crypterion;
		$this->routeManager = $routeGenerator;

		$this->middleware(function ($request, $next) {
			if (!$this->crypterion->isInstalled()) {
				return $next($request);
			} else {
				return abort(404);
			}
		});
	}

	/**
	 * Show installer index
	 *
	 * @param Request $request
	 * @return \Illuminate\View\View
	 */
	public function view()
	{
		$data = [
			'name'      => config('app.name'),
			'settings'  => [],
			'routeData' => $this->routeManager->generate('installer'),
			'csrfToken' => csrf_token(),
		];

		return view('installer', compact('data'));
	}
}
