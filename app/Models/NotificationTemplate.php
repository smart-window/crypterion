<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Lang;

class NotificationTemplate extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * Sms Messages
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function smsMessages()
	{
		return $this->hasMany(NotificationSmsMessage::class, 'template_id', 'id');
	}

	/**
	 * Database Messages
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function databaseMessages()
	{
		return $this->hasMany(NotificationDatabaseMessage::class, 'template_id', 'id');
	}

	/**
	 * Email messages
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function emailMessages()
	{
		return $this->hasMany(NotificationEmailMessage::class, 'template_id', 'id');
	}

	/**
	 * The accessors to append to the model's array form.
	 *
	 * @var array
	 */
	protected $appends = [
		'title'
	];

	/**
	 * The title attribute for this template
	 *
	 * @return array|mixed|string|null
	 */
	protected function getTitleAttribute()
	{
		return Lang::trans($this->getTransKey());
	}

	/**
	 * Get translation key for this template's title
	 *
	 * @return string
	 */
	protected function getTransKey()
	{
		return "notification.{$this->name}";
	}
}
