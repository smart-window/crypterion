<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TwoFactorController extends Controller
{
	/**
	 * Verify token endpoint
	 *
	 * @param Request $request
	 * @return bool
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function verify(Request $request)
	{
		if (!Auth::guard('api')->check()) {
			abort(403, trans('auth.action_forbidden'));
		}

		$this->validate($request, [
			'token' => [
				'required', function ($attribute, $value, $fail) {
					if ($value) {
						if (!Auth::user()->verifyTwoFactorKey($value)) {
							$fail(trans('auth.invalid_token'));
						}
					}
				},
			],
		]);

		Auth::user()->setTwoFactorApiVerification();
	}
}
