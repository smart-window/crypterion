<?php

namespace App\Notifications\Auth;

use App\Notifications\Notifier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class UserActivated extends Notification implements ShouldQueue
{
	use Queueable, Notifier;

	public $disableSmsChannel = true;
	public $disableDatabaseChannel = true;

	/**
	 * @var string
	 */
	protected $name = 'auth_user_activated';

	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $emailMessage = [
		'subject' => 'Account Activated!',
		'body'    => 'Your account has been activated!'
	];

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
			'user_name' => $notifiable->name
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
			'user_name' => trans('notification.parameters.user_name')
		];
	}
}
