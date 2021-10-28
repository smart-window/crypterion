<?php

namespace App\Events;

use App\Http\Resources\MarketplaceTrade as MarketplaceTradeResource;
use App\Models\MarketplaceTrade;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MarketplaceTradeSaved implements ShouldBroadcast
{
	use Dispatchable, InteractsWithSockets, SerializesModels;

	/**
	 * @var MarketplaceTrade
	 */
	private $trade;

	/**
	 * Create a new event instance.
	 *
	 * @param $trade
	 */
	public function __construct($trade)
	{
		$this->trade = $trade;
	}

	/**
	 * Get the channels the event should broadcast on.
	 *
	 * @return \Illuminate\Broadcasting\Channel|array
	 */
	public function broadcastOn()
	{
		$channels = [
			new PrivateChannel("Permission.ManageMarketplace")
		];

		if ($buyerId = $this->trade->buyer_id) {
			$channels[] = new PrivateChannel("Auth.User.{$buyerId}");
		}

		if ($sellerId = $this->trade->seller_id) {
			$channels[] = new PrivateChannel("Auth.User.{$sellerId}");
		};

		if ($chatId = $this->trade->chat_id) {
			$channels[] = new PrivateChannel("App.Chat.{$chatId}");
		}

		return $channels;
	}

	/**
	 * Get the data to broadcast.
	 *
	 * @return array
	 */
	public function broadcastWith()
	{
		return ['trade' => new MarketplaceTradeResource($this->trade)];
	}
}
