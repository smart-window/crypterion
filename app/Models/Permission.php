<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as Model;

class Permission extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * The accessors to append to the model's array form.
	 *
	 * @var array
	 */
	protected $appends = [
		'requires',
	];

	/**
	 * Permission requirements
	 *
	 * @return mixed
	 */
	public function getRequiresAttribute()
	{
		return config()->get("permission.requirements.{$this->name}");
	}
}
