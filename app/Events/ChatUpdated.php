<?php

namespace App\Events;

use App\Http\Resources\Chat as ChatResource;
use App\Models\Chat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

	/**
	 * @var Chat
	 */
	private $chat;

	/**
	 * Create a new event instance.
	 *
	 * @param Chat $chat
	 */
	public function __construct(Chat $chat)
	{
		$this->chat = $chat;
	}

	/**
	 * Get the channels the event should broadcast on.
	 *
	 * @return \Illuminate\Broadcasting\Channel|array
	 */
	public function broadcastOn()
	{
		return new PrivateChannel("App.Chat.{$this->chat->id}");
	}

	/**
	 * Get the data to broadcast.
	 *
	 * @return array
	 */
	public function broadcastWith()
	{
		return ['chat' => new ChatResource($this->chat)];
	}
}
