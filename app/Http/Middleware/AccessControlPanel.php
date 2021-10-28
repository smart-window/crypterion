<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AccessControlPanel
{
	/**
	 * Handle an incoming request.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @param \Closure $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
		$route = request()->route()->getName();

		if ($this->guard()->check() && $route == "admin") {
			if ($this->guard()->user()->cannot("access_control_panel")) {
				$this->guard()->logout();
			}
		}

		return $next($request);
	}

	/**
	 * Admin auth guard
	 *
	 * @return \Illuminate\Contracts\Auth\Guard
	 */
	public function guard()
	{
		return Auth::guard();
	}
}
