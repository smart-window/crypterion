<?php

namespace App\Notifications\Marketplace;

use App\Models\MarketplaceTrade;
use App\Notifications\Notifier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TradeReceivedRating extends Notification implements ShouldQueue
{
	use Queueable, Notifier;

    public $disableSmsChannel = true;

	/**
	 * @var string
	 */
	protected $name = 'marketplace_trade_received_rating';

	/**
	 * Default sms message attributes
	 *
	 * @var array
	 */
	protected $smsMessage = [
		'content' => 'You have received a {rating} star from {rated_by} on trade with token: {token}!'
	];

	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $databaseMessage = [
		'subject' => 'New Marketplace Rating',
		'message' => 'You have received a {rating} star from {rated_by} on trade with token: {token}!'
	];

	/**
	 * Default database message attributes
	 *
	 * @var array
	 */
	protected $emailMessage = [
		'subject' => 'New Marketplace Rating',
		'body'    => 'You have received a {rating} star from {rated_by} on trade with token: {token}!'
	];

	/**
	 * @var MarketplaceTrade
	 */
	protected $trade;

	/**
	 * @var string
	 */
	protected $ratedBy;

	/**
	 * @var int
	 */
	protected $rating;

	/**
	 * Create a new notification instance.
	 *
	 * @param $trade
	 * @param string $ratedBy
	 * @param int $rating
	 * @throws \Throwable
	 */
	public function __construct($trade = null, string $ratedBy = null, int $rating = null)
	{
		$this->rating = $rating;
		$this->ratedBy = $ratedBy;
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
			'rating'    => $this->rating,
			'rated_by'  => $this->ratedBy,
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
			'rated_by'  => trans('notification.parameters.rated_by'),
			'rating'    => trans('notification.parameters.rating'),
			'chat_id'   => trans('notification.parameters.chat_id'),
			'user_name' => trans('notification.parameters.user_name')
		];
	}
}
