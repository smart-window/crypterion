<?php

namespace App\Http\Resources;

use App\Models\User as UserModel;
use ArrayObject;
use Illuminate\Http\Resources\Json\JsonResource;


class User extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return array|ArrayObject
	 */
	public function toArray($request)
	{
		if (!($this->resource instanceof UserModel)) {
			return null;
		}

		$user = $request->user();

		return [
			'id'                          => $this->id,
			'currency'                    => $this->currency,
			'name'                        => $this->name,
			'last_seen_at'                   => $this->last_seen_at,
			'presence'                    => $this->presence,
			'phone_verified_at'           => $this->phone_verified_at,
			'email_verified_at'           => $this->email_verified_at,
			'inactive_until'              => $this->inactive_until,
			'pivot'                       => $this->when($this->pivot, $this->pivot),
			'average_marketplace_rating'  => $this->average_marketplace_rating,
			'total_marketplace_rating'    => $this->total_marketplace_rating,
			'profile'                     => $this->profile,
			'marketplace_stats'           => $this->marketplace_stats,
			'authenticated_contact_pivot' => $this->when(
				$user && !$user->is($this), $this->authenticated_contact_pivot
			),
			'location'                    => $this->location,
			'trusted_by_count'            => $this->trusted_by_count,
			'blocked_by_count'            => $this->blocked_by_count,
			'created_at'                  => $this->created_at,
		];
	}
}
