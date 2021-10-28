<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Events\UserLoggedIn;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
	/*
	|--------------------------------------------------------------------------
	| Login Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles authenticating users for the application and
	| redirecting them to your home screen. The controller uses a trait
	| to conveniently provide its functionality to your applications.
	|
	*/

	use AuthenticatesUsers;

	/**
	 * Where to redirect users after login.
	 *
	 * @var string
	 */
	protected $redirectTo = '/home';

	/**
	 * Create a new controller instance.
	 */
	public function __construct()
	{
		$this->middleware('guest')->except('logout');
	}

	/**
	 * Get the login username to be used by the controller.
	 *
	 * @return string
	 */
	public function username()
	{
		return getAuthUsername();
	}

	/**
	 * Validate the user login request.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return void
	 *
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateLogin(Request $request)
	{
		$request->validate([
			$this->username() => 'required|string',
			'password'        => 'required|string',
			'recaptcha'       => getRecaptchaRules()
		]);

		$credentials = $this->credentials($request);

		if (!$this->guard()->validate($credentials)) {
			$this->incrementLoginAttempts($request);
			$this->sendFailedLoginResponse($request);
		}

		$user = $this->guard()->getProvider()->retrieveByCredentials($credentials);

		if ($user instanceof User) {
			if ($user->cannot('access_control_panel')) {
				$this->incrementLoginAttempts($request);
				$this->sendFailedLoginResponse($request);
			}

			if ($user->shouldVerifyTwoFactorForAuthentication()) {
				$request->validate([
					'token' => [
						'required', function ($attribute, $value, $fail) use ($user) {
							if ($value !== null) {
								if (!$user->verifyTwoFactorKey($value)) {
									$fail(trans('auth.invalid_token'));
								}
							}
						},
					],
				]);
			}

			$deactivation = $user->inactive_until;

			if ($deactivation && $deactivation > now()) {
				$this->incrementLoginAttempts($request);

				throw ValidationException::withMessages([
					$this->username() => [
						trans('auth.deactivated', [
							'date' => $deactivation->toFormattedDateString()
						])
					],
				]);
			}
		}
	}

	/**
	 * Attempt to log the user into the application.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return bool
	 */
	protected function attemptLogin(Request $request)
	{
		return $this->guard()->attempt(
			$this->credentials($request), (bool) $request->get('remember')
		);
	}

	/**
	 * The user has been authenticated.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @param User $user
	 * @return mixed
	 * @throws ValidationException
	 */
	protected function authenticated(Request $request, $user)
	{
		$user->update(['last_login_at' => now()]);

		event(new UserLoggedIn($user, $request));

		return response()->json($user->toArray());
	}

	/**
	 * The user has logged out of the application.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return mixed
	 */
	protected function loggedOut(Request $request)
	{
		return response()->json([]);
	}
}
