<?php

namespace App\Events;

use App\Http\Resources\ChatMessage as ChatMessageResource;
use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChatMessage implements ShouldBroadcast
{
	use Dispatchable, InteractsWithSockets, SerializesModels;

	/**
	 * @var ChatMessage
	 */
	private $message;

	/**
	 * Create a new event instance.
	 *
	 * @param ChatMessage $message
	 */
	public function __construct(ChatMessage $message)
	{
		$this->message = $message;
	}

	/**
	 * Get the channels the event should broadcast on.
	 *
	 * @return \Illuminate\Broadcasting\Channel|array
	 */
	public function broadcastOn()
	{
		$channels = [
			new PrivateChannel("App.Chat.{$this->message->chat_id}")
		];

		$this->message->chat->participants()
			->get()->each(function ($participant) use (&$channels) {
				$channels[] = new PrivateChannel("Auth.User.{$participant->user_id}");
			});

        return $channels;
    }

	/**
	 * Get the data to broadcast.
	 *
	 * @return array
	 */
	public function broadcastWith()
	{
		return ['message' => new ChatMessageResource($this->message)];
	}
}
