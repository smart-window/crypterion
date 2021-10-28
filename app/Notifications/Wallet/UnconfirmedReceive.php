<?php

namespace App\Notifications\Wallet;

use App\Models\TransferRecord;
use App\Notifications\Notifier;
use App\Notifications\PreferredChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class UnconfirmedReceive extends Notification implements ShouldQueue
{
	use Queueable, Notifier, PreferredChannels;

    public $disableSmsChannel = true;

	/**
	 * @var string
	 */
	protected $name = 'wallet_unconfirmed_receive';

	/**
	 * Default sms message attributes
	 *
	 * @var array
	 */
	protected $smsMessage = [
		'content' => 'An amount of {formatted_value_price} was sent into one of {coin} wallet address, but has not been confirmed!'
	];

	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $databaseMessage = [
		'subject' => 'You have a new unconfirmed {coin} transaction!',
		'message' => 'An amount of {formatted_value_price} was sent into one of {coin} wallet address, but has not been confirmed!'
	];

	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $emailMessage = [
		'subject' => 'You have a new unconfirmed {coin} transaction!',
		'body'    => 'An amount of {formatted_value_price} was sent into one of {coin} wallet address, but has not been confirmed!'
	];

	/**
	 * @var TransferRecord
	 */
	protected $record;

	/**
	 * Create a new notification instance.
	 * @param $record
	 * @throws \Throwable
	 */
	public function __construct($record = null)
	{
		$this->record = $record;
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
			'app_name'              => config('app.name'),
			'coin'                  => $this->record ? $this->record->coin : null,
			'formatted_value_price' => $this->record ? $this->record->formatted_value_price : null,
			'value'                 => $this->record ? $this->record->value : null,
			'value_price'           => $this->record ? $this->record->value_price : null,
			'user_name'             => $notifiable->name,
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
			'app_name'              => trans('notification.parameters.app_name'),
			'coin'                  => trans('notification.parameters.coin'),
			'formatted_value_price' => trans('notification.parameters.formatted_value_price'),
			'value'                 => trans('notification.parameters.value'),
			'value_price'           => trans('notification.parameters.value_price'),
			'user_name'             => trans('notification.parameters.user_name')
		];
	}
}
