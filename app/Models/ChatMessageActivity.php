<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Lang;

class ChatMessageActivity extends Model
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
		'parameters' => "array"
	];

	/**
	 * The accessors to append to the model's array form.
	 *
	 * @var array
	 */
	protected $appends = [
		'body'
	];

	/**
	 * The body attribute for this activity
	 *
	 * @return array|mixed|string|null
	 */
	protected function getBodyAttribute()
	{
		return Lang::trans($this->getTransKey(), $this->getReplacements());
	}

	/**
	 * Get translation key for this activity's body
	 *
	 * @return string
	 */
	protected function getTransKey()
	{
		return "chat.activities.{$this->type}";
	}

	/**
	 * @return array|mixed
	 */
	protected function getReplacements()
	{
		return is_array($this->parameters) ? $this->parameters : [];
	}

	public function message()
	{
		return $this->belongsTo(ChatMessage::class, 'message_id', 'id');
	}
}
