<?php

namespace App\Http\Resources;

use App\Models\MarketplaceTrade as MarketplaceTradeModel;
use App\Models\Rating as RatingModel;
use App\Models\User as UserModel;
use ArrayObject;
use Illuminate\Http\Resources\Json\JsonResource;

class Rating extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return array|ArrayObject
	 */
	public function toArray($request)
	{
		if (!($this->resource instanceof RatingModel)) {
			return null;
		}

		return [
			'id'         => $this->id,
			'comment'    => $this->comment,
			'rating'     => $this->rating,
			'subject'    => $this->when(
				$this->relationLoaded('subject'), $this->subject()
			),
			'rater'      => $this->when(
				$this->relationLoaded('rater'), $this->rater()
			),
			'created_at' => $this->created_at
		];
	}

	/**
	 * Create resource of possible subject
	 *
	 * @return User|mixed
	 */
	public function rater()
	{
		if ($this->rater instanceof UserModel) {
			return new User($this->rater);
		}
		return $this->rater;
	}

	/**
	 * Create subject's resource
	 *
	 * @return MarketplaceTrade|mixed
	 */
	public function subject()
	{
		if ($this->subject instanceof MarketplaceTradeModel) {
			return new MarketplaceTrade($this->subject);
		}
		return $this->subject;
	}
}
