<?php

namespace App\Notifications\Auth;

use App\Notifications\Notifier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class UserRegistered extends Notification implements ShouldQueue
{
	use Queueable, Notifier;

	public $disableSmsChannel = true;

	/**
	 * @var string
	 */
	protected $name = 'auth_user_registered';


	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $databaseMessage = [
		'subject' => 'Registration Successful!',
		'message' => 'Your registration was successful!'
	];

	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $emailMessage = [
		'subject' => 'Registration Successful!',
		'body'    => 'Your registration was successful!'
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
