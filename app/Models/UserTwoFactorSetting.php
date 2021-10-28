<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTwoFactorSetting extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * The attributes that should be cast to native types.
	 *
	 * @var array
	 */
	protected $casts = [
		'enabled'           => "boolean",
		'authentication'    => "boolean",
		'outgoing_transfer' => "boolean",
		'marketplace'       => "boolean",
	];

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|User
	 */
	public function user()
	{
		return $this->belongsTo(User::class, 'user_id', 'id');
	}
}
