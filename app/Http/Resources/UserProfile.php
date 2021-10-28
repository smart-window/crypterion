<?php

namespace App\Http\Resources;

use App\Models\UserProfile as UserProfileModel;
use ArrayObject;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfile extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|ArrayObject
     */
    public function toArray($request)
    {
	    if (!($this->resource instanceof UserProfileModel)) {
		    return null;
	    }

        return parent::toArray($request);
    }
}
