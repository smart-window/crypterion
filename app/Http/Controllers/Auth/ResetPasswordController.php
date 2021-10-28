<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\Verification\EmailVerificationToken;
use App\Notifications\Verification\PhoneVerificationToken;
use App\Traits\ThrottlesEmails;
use App\Traits\ThrottlesSms;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class ResetPasswordController extends Controller
{
	/*
	|--------------------------------------------------------------------------
	| Password Reset Controller
	|--------------------------------------------------------------------------
	|
	| This controller is responsible for handling password reset requests
	| and uses a simple trait to include this behavior. You're free to
	| explore this trait and override any methods you wish to tweak.
	|
	*/
	use ThrottlesEmails, ThrottlesSms;

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('guest');
	}

	/**
	 * Reset the given user's password.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
	 */
	public function reset(Request $request)
	{
		$request->validate([
			'token'     => 'required',
			'phone'     => 'nullable|required_without:email',
			'email'     => 'nullable|required_without:phone',
			'password'  => 'required|confirmed|min:8',
			'recaptcha' => getRecaptchaRules()
		]);

		if ($phone = $request->get('phone')) {
			$user = $this->findUserByPhone($phone);
		};

		if ($email = $request->get('email')) {
			$user = $this->findUserByEmail($email);
		}

		if (!(isset($user) && $user instanceof User)) {
			abort(422, trans('auth.user_not_found'));
		}

		$token = $request->get('token');
		$password = $request->get('password');

		if ($this->broker()->tokenExists($user, $token)) {
			$this->resetPassword($user, $password);
			$this->broker()->deleteToken($user);
		} else {
			abort(422, trans('passwords.token'));
		};
	}

	/**
	 * Reset the given user's password.
	 *
	 * @param User $user
	 * @param string $password
	 * @return void
	 */
	protected function resetPassword($user, $password)
	{
		$user->update([
			'password' => Hash::make($password)
		]);

		event(new PasswordReset($user));
	}

	/**
	 * Send phone verification token
	 *
	 * @param Request $request
	 * @throws \Throwable
	 */
	public function sendPhoneToken(Request $request)
	{
		$request->validate([
			'recaptcha' => getRecaptchaRules()
		]);

		$phone = $request->get('phone');

		if ($user = $this->findUserByPhone($phone)) {
			if ($this->hasTooManySmsAttempts($user)) {
				abort(403, trans('auth.phone_throttle'));
			}

			$token = $user->generatePhoneVerificationToken();
			$user->notify(new PhoneVerificationToken($token));

			$this->incrementSmsAttempts($user);
		}
	}

	/**
	 * Find user by verified phone
	 *
	 * @param $phone
	 * @return User|null
	 */
	protected function findUserByPhone($phone)
	{
		return User::whereNotNull('phone_verified_at')
			->latest()->where('phone', $phone)->first();
	}

	/**
	 * Verify phone token
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function verifyPhoneToken(Request $request)
	{
		$this->validate($request, [
			'token' => 'required|string|min:3',
			'phone' => 'required|string|min:3',
		]);

		$phone = $request->get('phone');
		$token = $request->get('token');

		$user = $this->findUserByPhone($phone);

		if (!$user || !$user->checkPhoneVerificationToken($token)) {
			abort(422, trans('auth.invalid_verification_token'));
		}

		return [
			'token' => $this->createVerificationToken($user)
		];
	}

	/**
	 * Send email verification token
	 *
	 * @param Request $request
	 * @param $name
	 * @throws \Throwable
	 */
	public function sendEmailToken(Request $request)
	{
		$request->validate([
			'recaptcha' => getRecaptchaRules()
		]);

		$email = $request->get('email');

		if ($user = $this->findUserByEmail($email)) {
			if ($this->hasTooManyEmailAttempts($user)) {
				abort(403, trans('auth.email_throttle'));
			}

			$token = $user->generateEmailVerificationToken();
			$user->notify(new EmailVerificationToken($token));

			$this->incrementEmailAttempts($user);
		}
	}

	/**
	 * Find user by verified email
	 *
	 * @param $email
	 * @return User|null
	 */
	protected function findUserByEmail($email)
	{
		return User::whereNotNull('email_verified_at')
			->latest()->where('email', $email)->first();
	}

	/**
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function verifyEmailToken(Request $request)
	{
		$this->validate($request, [
			'token' => 'required|string|min:3',
			'email' => 'required|string|min:3',
		]);

		$email = $request->get('email');
		$token = $request->get('token');

		$user = $this->findUserByEmail($email);

		if (!$user || !$user->checkEmailVerificationToken($token)) {
			abort(422, trans('auth.invalid_verification_token'));
		}

		return [
			'token' => $this->createVerificationToken($user)
		];
	}

	/**
	 * Create verification token
	 *
	 * @param $user
	 * @return string
	 */
	protected function createVerificationToken($user)
	{
		return $this->broker()->createToken($user);
	}

	/**
	 * Get the broker to be used during password reset.
	 *
	 * @return \Illuminate\Contracts\Auth\PasswordBroker|\Illuminate\Auth\Passwords\PasswordBroker
	 */
	protected function broker()
	{
		return Password::broker();
	}
}
