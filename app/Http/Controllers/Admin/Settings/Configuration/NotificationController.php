<?php

namespace App\Http\Controllers\Admin\Settings\Configuration;

use App\Notifications\Test\EmailTest;
use App\Notifications\Test\SmsTest;
use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
	/**
	 * Get notification data
	 *
	 * @return array
	 */
	public function data()
	{
		$settings = settings('notification');
		$keys = collect($this->properties())->keys();
		return $settings->only($keys->toArray());
	}

	/**
	 * Validate properties
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateProperties(Request $request)
	{
		$rules = collect($this->properties())
			->map(function ($data) {
				return $data['rules'] ?? null;
			})->filter()->toArray();

		return $this->validate($request, $rules);
	}

	/**
	 * Update notification
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function update(Request $request)
	{
		$this->validateProperties($request);

		$properties = collect($this->properties());
		$settings = settings('notification');

		$values = $properties->map(function ($data, $key) use ($request) {
			$value = $request->get($key);

			if (isset($data['parse']) && is_callable($data['parse'])) {
				$value = $data['parse']($value);
			}

			return $value;
		});

		$settings->update($values->toArray());
		$keys = $properties->keys();
		return $settings->only($keys->toArray());
	}

	/**
	 * Notification properties
	 *
	 * @return array
	 */
	public function properties()
	{
		return [
			'enable_email'    => [
				'rules' => [
					'nullable', 'boolean',
					function ($attribute, $value, $fail) {
						if ($value) {
							if (!Auth::user()->email) {
								return $fail(trans('auth.email_required_on_profile'));
							}

							try {
								Auth::user()->notify(new EmailTest());
							} catch (Exception $e) {
								$fail($e->getMessage());
							}
						}
					}
				],
				'parse' => function ($value) {
					return (bool) $value;
				}
			],
			'enable_database' => [
				'rules' => 'nullable|boolean',
				'parse' => function ($value) {
					return (bool) $value;
				}
			],
			'enable_sms'      => [
				'rules' => [
					'nullable', 'boolean',
					function ($attribute, $value, $fail) {
						if ($value) {
							if (!Auth::user()->phone) {
								return $fail(trans('auth.phone_required_on_profile'));
							}

							try {
								Auth::user()->notify(new SmsTest());
							} catch (Exception $e) {
								$fail($e->getMessage());
							}
						}
					}
				],
				'parse' => function ($value) {
					return (bool) $value;
				}
			],
		];
	}
}
