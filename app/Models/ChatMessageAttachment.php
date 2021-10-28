<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessageAttachment extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * The attributes that should be hidden for arrays.
	 *
	 * @var array
	 */
	protected $hidden = [
		'hash_name'
	];

	/**
	 * The accessors to append to the model's array form.
	 *
	 * @var array
	 */
	protected $appends = [
		'url',
	];

	/**
	 * Get api download url for this attachment.
	 *
	 * @return string
	 */
	public function getUrlAttribute()
	{
		return route('storage.chat-message.download-attachment', [
			'message' => $this->message_id
		]);
	}

	public function message()
	{
		return $this->belongsTo(ChatMessage::class, 'message_id', 'id');
	}
}
