<?php

namespace App\Notifications\Verification;

use App\Notifications\Notifier;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PhoneVerificationToken extends Notification
{
    use Queueable, Notifier;

	public $disableEmailChannel = true;
	public $disableDatabaseChannel = true;

	/**
	 * @var string
	 */
	protected $name = 'phone_verification_token';

	/**
	 * Default sms message attributes
	 *
	 * @var array
	 */
	protected $smsMessage = [
		'content' => '{code} is your verification code. It expires in {minutes} minutes.'
	];

	/**
	 * @var int
	 */
	protected $code;

	/**
	 * Create a new notification instance.
	 *
	 * @param $code
	 * @throws \Throwable
	 */
	public function __construct($code = null)
	{
		$this->code = $code;
	}

	/**
	 *  Replacement Parameters and Values
	 *
	 * @param $notifiable
	 * @return array
	 */
	public function parameters($notifiable)
	{
		return [
			'app_name'  => config('app.name'),
			'minutes'   => config('auth.token_expires_in'),
			'code'      => $this->code,
			'user_name' => $notifiable->name,
		];
	}

	/**
	 * Get parameter names
	 *
	 * @return array
	 */
	public function parameterNames()
	{
		return [
			'app_name'  => trans('notification.parameters.app_name'),
			'code'      => trans('notification.parameters.code'),
			'minutes'   => trans('notification.parameters.minutes'),
			'user_name' => trans('notification.parameters.user_name')
		];
	}
}
