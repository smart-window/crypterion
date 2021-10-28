<?php

namespace App\Http\Resources;

use App\Models\Chat as ChatModel;
use ArrayObject;
use Illuminate\Http\Resources\Json\JsonResource;

class Chat extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return ArrayObject|array
	 */
	public function toArray($request)
	{
		if (!($this->resource instanceof ChatModel)) {
			return null;
		}

		return [
			'id'             => $this->id,
			'participants'   => ChatParticipant::collection($this->whenLoaded('participants')),
			'latest_message' => $this->getLatestMessage(),
			'updated_at'     => $this->updated_at,
			'created_at'     => $this->created_at,
		];
	}
}
