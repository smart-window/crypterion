<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationEmailMessage extends Model
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
		'locale_data',
	];

	/**
	 * Get locale data
	 *
	 * @return bool|\Illuminate\Config\Repository|mixed|null
	 */
	public function getLocaleDataAttribute()
	{
		return config("locales.{$this->locale}");
	}

	public function template()
	{
		return $this->belongsTo(NotificationTemplate::class, 'template_id', 'id');
	}
}
