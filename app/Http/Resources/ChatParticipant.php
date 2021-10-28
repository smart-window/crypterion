<?php

namespace App\Http\Resources;

use App\Models\ChatParticipant as ChatParticipantModel;
use ArrayObject;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatParticipant extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return array|ArrayObject
	 */
	public function toArray($request)
	{
		if (!($this->resource instanceof ChatParticipantModel)) {
			return null;
		}

		return [
			'id'           => $this->id,
			'last_read_at' => $this->last_read_at,
			'user_id'      => $this->user_id,
			'chat_id'      => $this->chat_id,
			'user'         => new User($this->whenLoaded('user')),
			'created_at'   => $this->created_at,
		];
	}
}
