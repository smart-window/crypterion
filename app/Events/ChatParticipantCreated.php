<?php

namespace App\Events;

use App\Http\Resources\ChatParticipant as ChatParticipantResource;
use App\Models\ChatParticipant;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatParticipantCreated implements ShouldBroadcast
{
	use Dispatchable, InteractsWithSockets, SerializesModels;

	/**
	 * @var ChatParticipant
	 */
	private $participant;

	/**
	 * Create a new event instance.
	 *
	 * @param $participant
	 */
	public function __construct($participant)
	{
		$this->participant = $participant;
	}

	/**
	 * Get the channels the event should broadcast on.
	 *
	 * @return \Illuminate\Broadcasting\Channel|array
	 */
	public function broadcastOn()
	{
		return [
			new PrivateChannel("App.Chat.{$this->participant->chat_id}"),
			new PrivateChannel("Auth.User.{$this->participant->user_id}")
		];
	}

	/**
	 * Get the data to broadcast.
	 *
	 * @return array
	 */
	public function broadcastWith()
	{
		return ['participant' => new ChatParticipantResource($this->participant)];
	}
}
