<?php

namespace App\Http\Resources;

use App\Models\ChatMessage as ChatMessageModel;
use ArrayObject;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessage extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return array|ArrayObject
	 */
	public function toArray($request)
	{
		if (!($this->resource instanceof ChatMessageModel)) {
			return null;
		}

		return [
			'id'         => $this->id,
			'user_id'    => $this->user_id,
			'user'       => new User($this->whenLoaded('user')),
			'type'       => $this->type,
			'activity'   => $this->when($this->type == 'activity', $this->activity),
			'attachment' => $this->when($this->type == 'attachment', $this->attachment),
			'text'       => $this->when($this->type == 'text', $this->text),
			'chat_id'    => $this->chat_id,
			'created_at' => $this->created_at,
			'updated_at' => $this->updated_at,
		];
	}
}
