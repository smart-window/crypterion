<?php

namespace App\Http\Controllers\Installer;

use App\Http\Controllers\Controller;
use App\Providers\License;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use JSsVPSDioNXpfRC;

class LicenseController extends Controller
{
	/**
	 * @var JSsVPSDioNXpfRC
	 */
	protected $crypterion;

	/**
	 * IndexController constructor.
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
	 * @param Request $request
	 * @return \Illuminate\Support\Collection
	 */
	protected function details(Request $request)
	{
		return collect($request->only(['code', 'email']));
	}

	/**
	 * Verify license
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function verify(Request $request)
	{
		$this->validate($request, [
			'code'  => 'required|string',
			'email' => 'required|email',
		]);

		try {
			$license = $this->crypterion->verifyLicense(
				$request->get('code'),
				$request->get('email')
			);

			if (!$license instanceof License) {
				throw new Exception("Invalid");
			}
		} catch (Exception $e) {
			throw ValidationException::withMessages([
				'code' => [$e->getMessage()]
			]);
		}
	}
}
