<?php

namespace App\Http\Controllers\User;

use App\Events\UserPictureChanged;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\Verification\EmailVerificationToken;
use App\Notifications\Verification\PhoneVerificationToken;
use App\Traits\ThrottlesEmails;
use App\Traits\ThrottlesSms;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
	use ThrottlesEmails, ThrottlesSms;

	/**
	 * Get notification settings
	 *
	 * @param $name
	 * @return array
	 */
	public function notificationSettings($name)
	{
		return $this->findUserByName($name)->getNotificationSettings();
	}

	/**
	 * @param Request $request
	 * @param $name
	 * @throws \Throwable
	 */
	public function resendEmailToken(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		if ($this->hasTooManyEmailAttempts($user)) {
			abort(403, trans('auth.email_throttle'));
		}

		$token = $user->generateEmailVerificationToken();
		$user->notify(new EmailVerificationToken($token));

		$this->incrementEmailAttempts($user);
	}

	/**
	 * @param Request $request
	 * @param $name
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function verifyEmailToken(Request $request, $name)
	{
		$this->validate($request, ['token' => 'required']);

		$user = $this->findUserByName($name);
		$token = $request->get('token');

		if (!$user->checkEmailVerificationToken($token)) {
			abort(422, trans('auth.invalid_verification_token'));
		} else {
			$user->update(['email_verified_at' => now()]);
		}
	}

	/**
	 * @param Request $request
	 * @param $name
	 * @throws \Throwable
	 */
	public function resendPhoneToken(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		if ($this->hasTooManySmsAttempts($user)) {
			abort(403, trans('auth.phone_throttle'));
		}

		$token = $user->generatePhoneVerificationToken();
		$user->notify(new PhoneVerificationToken($token));

		$this->incrementSmsAttempts($user);
	}

	/**
	 * @param Request $request
	 * @param $name
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function verifyPhoneToken(Request $request, $name)
	{
		$this->validate($request, ['token' => 'required']);

		$user = $this->findUserByName($name);
		$token = $request->get('token');

		if (!$user->checkPhoneVerificationToken($token)) {
			abort(422, trans('auth.invalid_verification_token'));
		} else {
			$user->update(['phone_verified_at' => now()]);
		}
	}

	/**
	 * Update user preference
	 *
	 * @param Request $request
	 * @param $name
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function updatePreference(Request $request, $name)
	{
		$this->validate($request, [
			'currency' => [
				'required', Rule::in($this->getCurrencies()->keys()->toArray())
			]
		]);

		$this->findUserByName($name)->update([
			'currency' => $request->get('currency')
		]);
	}

	/**
	 * Update user details
	 *
	 * @param Request $request
	 * @param $name
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function updateDetails(Request $request, $name)
	{
		$this->validate($request, [
			'bio'        => 'nullable|string|max:1000',
			'first_name' => 'nullable|string|max:25',
			'last_name'  => 'nullable|string|max:25',
		]);

		$this->findUserByName($name)->profile->update([
			'bio'        => $request->get('bio'),
			'first_name' => $request->get('first_name'),
			'last_name'  => $request->get('last_name'),
		]);
	}

	/**
	 * Get two factor secret request
	 *
	 * @param Request $request
	 * @param $name
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function twoFactorRequest(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		$this->validate($request, [
			'token' => [
				'nullable', 'required_without:password',
				function ($attribute, $value, $fail) use ($user) {
					if ($value !== null) {
						if (!$user->twoFactorSetting->enabled) {
							$fail(trans('auth.two_factor_disabled'));
						} else {
							if (!$user->verifyTwoFactorKey($value)) {
								$fail(trans('auth.invalid_two_factor_token'));
							}
						}
					}
				},
			],

			'password' => [
				'nullable', 'required_without:token',
				function ($attribute, $value, $fail) use ($user) {
					if ($value !== null) {
						if (!$user->twoFactorSetting->enabled) {
							if (!Hash::check($value, $user->password)) {
								$fail(trans('auth.invalid_password'));
							}
						} else {
							$fail(trans('auth.two_factor_enabled'));
						}
					}
				},
			]
		]);

		return [
			'url'    => $user->getTwoFactorQRCodeUrl(),
			'secret' => $user->two_factor_secret
		];
	}

	/**
	 * Enable two factor authentication
	 *
	 * @param Request $request
	 * @param $name
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function twoFactorEnable(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		$this->validate($request, [
			'token' => [
				'required', function ($attribute, $value, $fail) use ($user) {
					if ($value !== null) {
						if (!$user->verifyTwoFactorKey($value)) {
							$fail(trans('auth.invalid_two_factor_token'));
						}
					}
				},
			],
		]);

		$user->twoFactorSetting->update(['enabled' => true]);
	}

	/**
	 * Update user's two factor settings
	 *
	 * @param Request $request
	 * @param $name
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function twoFactorConfigure(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		$this->validate($request, [
			'token' => [
				'required', function ($attribute, $value, $fail) use ($user) {
					if ($value !== null) {
						if (!$user->verifyTwoFactorKey($value)) {
							$fail(trans('auth.invalid_two_factor_token'));
						}
					}
				},
			],
		]);

		$user->twoFactorSetting->update([
			'authentication'    => $request->get('authentication'),
			'outgoing_transfer' => $request->get('outgoing_transfer'),
			'marketplace'       => $request->get('marketplace')
		]);
	}

	/**
	 * Change user's password
	 *
	 * @param Request $request
	 * @param $name
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function changePassword(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		$this->validate($request, [
			'password' => [
				'required',
				function ($attribute, $value, $fail) use ($user) {
					if ($value !== null) {
						if (!Hash::check($value, $user->password)) {
							$fail(trans('auth.invalid_password'));
						}
					}
				},
			],

			'new_password' => [
				'required', 'string', 'min:8', 'confirmed',
				'different:password'
			]
		]);

		$password = $request->get('new_password');

		$user->password = Hash::make($password);
		$user->save();
	}

	/**
	 * Update notification settings
	 *
	 * @param Request $request
	 * @param $name
	 * @return void
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function updateNotificationSettings(Request $request, $name)
	{
		$this->validate($request, [
			'notification' => 'required|array'
		]);

		$settings = config('notifications.settings');
		$userSettings = $this->findUserByName($name)->notificationSetting;
		$data = $request->get('notification');

		foreach ($userSettings as $userSetting) {
			if (isset($settings[$userSetting->name])) {
				$default = $settings[$userSetting->name];

				foreach ($default as $channel => $status) {
					if ($status) {
						$userSetting->fill([
							$channel => (
								isset($data[$userSetting->name]) &&
								isset($data[$userSetting->name][$channel]) &&
								$data[$userSetting->name][$channel]
							)
						]);
					}
				}

				$userSetting->save();
			}
		}
	}


	/**
	 * Update verification details
	 *
	 * @param Request $request
	 * @param $name
	 * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
	 * @throws \Illuminate\Validation\ValidationException
	 * @throws \Throwable
	 */
	public function updateVerification(Request $request, $name)
	{
		$this->validate($request, [
			'email'            => 'nullable|email:rfc,dns,spoof',
			'phone'            => 'nullable|phone',
			'current_password' => 'nullable|required_with:phone,email',
			'phone_country'    => 'required_with:phone',
		]);

		$user = $this->findUserByName($name);

		$email = $request->get('email');
		$phone = $request->get('phone');
		$currentPassword = $request->get('current_password');

		if ($email && $email != $user->email) {
			$this->validate($request, ['email' => 'unique:users']);

			if (!Hash::check($currentPassword, $user->password)) {
				abort(422, trans('auth.invalid_password'));
			}

			DB::transaction(function () use (&$user, $email) {
				$user->update([
					'email'             => $email,
					'email_verified_at' => null
				]);

				if (!$this->hasTooManyEmailAttempts($user)) {
					$token = $user->generateEmailVerificationToken();
					$user->notify(new EmailVerificationToken($token));

					$this->incrementEmailAttempts($user);
				} else {
					abort(403, trans('auth.email_throttle'));
				}
			});
		}

		if ($phone && $phone != $user->phone) {
			$this->validate($request, ['phone' => 'unique:users']);

			if (!Hash::check($currentPassword, $user->password)) {
				abort(422, trans('auth.invalid_password'));
			}

			DB::transaction(function () use (&$user, $phone) {
				$user->update([
					'phone'             => $phone,
					'phone_verified_at' => null
				]);

				if (!$this->hasTooManySmsAttempts($user)) {
					$token = $user->generatePhoneVerificationToken();
					$user->notify(new PhoneVerificationToken($token));

					$this->incrementSmsAttempts($user);
				} else {
					abort(403, trans('auth.phone_throttle'));
				}
			});
		}
	}

	/**
	 * Upload and save picture
	 *
	 * @param Request $request
	 * @param $name
	 * @return \Illuminate\Contracts\Routing\ResponseFactory|\Illuminate\Http\Response
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function uploadPicture(Request $request, $name)
	{
		$this->validate($request, [
			'file' => [
				'required', 'file', 'max:100', 'mimetypes:image/png,image/jpeg',
				'dimensions:ratio=1'
			]
		]);

		$avatar = $request->file('file');
		$fileName = 'avatar.' . $avatar->extension();
		$user = $this->findUserByName($name);
		$path = $user->profilePicturePath();
		$avatar->storePubliclyAs($path, $fileName, [
			'disk' => 'public'
		]);

		$uploadId = str_random(5);
		$urlPath = "storage/{$path}/{$fileName}?id={$uploadId}";

		$user->profile->update(['picture' => $urlPath]);
		event(new UserPictureChanged($user, $request));
	}

	/**
	 * @param $name
	 * @return \App\Models\User
	 */
	private function findUserByName($name)
	{
		$user = User::where('name', $name)
			->firstOrFail();

		if (!Auth::user()->canEdit($user)) {
			abort(403, trans('auth.access_forbidden'));
		} else {
			return $user;
		}
	}

	/**
	 * @return \Illuminate\Support\Collection
	 */
	protected function getCurrencies()
	{
		return collect(currency()->getCurrencies());
	}
}
