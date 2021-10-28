<?php

namespace App\Notifications\Marketplace;

use App\Models\MarketplaceTrade;
use App\Notifications\Notifier;
use App\Notifications\PreferredChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TradeMarkedAsPaid extends Notification implements ShouldQueue
{
	use Queueable, Notifier, PreferredChannels;

    public $disableSmsChannel = true;

	/**
	 * @var string
	 */
	protected $name = 'marketplace_trade_marked_as_paid';

	/**
	 * Default sms message attributes
	 *
	 * @var array
	 */
	protected $smsMessage = [
		'content' => 'One of the trades you are involved in, with token: {token} has been marked as paid!'
	];

	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $databaseMessage = [
		'subject' => 'Trade Marked As Paid!',
		'message' => 'One of the trades you are involved in, with token: {token} has been marked as paid!'
	];

	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $emailMessage = [
		'subject' => 'Trade Marked As Paid!',
		'body'    => 'One of the trades you are involved in, with token: {token} has been marked as paid!'
	];

	/**
	 * @var MarketplaceTrade
	 */
	protected $trade;

	/**
	 * Create a new notification instance.
	 *
	 * @param $trade
	 * @return void
	 * @throws \Throwable
	 */
	public function __construct($trade = null)
	{
		$this->trade = $trade;
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
			'token'     => $this->trade ? $this->trade->id : null,
			'chat_id'   => $this->trade ? $this->trade->chat_id : null,
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
			'token'     => trans('notification.parameters.token'),
			'chat_id'   => trans('notification.parameters.chat_id'),
			'user_name' => trans('notification.parameters.user_name')
		];
	}
}
