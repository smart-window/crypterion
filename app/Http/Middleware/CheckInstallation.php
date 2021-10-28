<?php

namespace App\Http\Middleware;

use Closure;
use JSsVPSDioNXpfRC;

class CheckInstallation
{
	/**
	 * @var JSsVPSDioNXpfRC
	 */
	protected $crypterion;

	/**
	 * VerifyLicense constructor.
	 *
	 * @param JSsVPSDioNXpfRC $crypterion
	 */
	public function __construct($crypterion)
	{
		if (!is_subclass_of($crypterion, 'JSsVPSDioNXpfRC')) {
			return app()->abort(500, 'Corrupted filesystem.');
		}

		$this->crypterion = $crypterion;
	}

	/**
	 * Handle an incoming request.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @param \Closure $next
	 * @param null $method
	 * @return mixed
	 * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
	 * @throws \Psr\SimpleCache\InvalidArgumentException
	 */
	public function handle($request, Closure $next, $method = null)
	{
		if (!$this->crypterion->isInstalled()) {
			if (!$request->expectsJson()) {
				return redirect()->route('installer');
			} else {
				return app()->abort(402);
			}
		}

		if (!is_null($method)) {
			switch ($method) {
				case 'verify':
					if (!$this->crypterion->license()->isValid()) {
						return app()->abort(402, 'Invalid License');
					}
					break;
				default:
					return abort(400);
			}
		}
		return $next($request);
	}
}
