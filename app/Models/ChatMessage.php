<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use JSsVPSDioNXpfRC;

class ChatMessage extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * The relationships that should always be loaded.
	 *
	 * @var array
	 */
	protected $with = [
		'activity', 'attachment', 'text', 'user'
	];


	/**
	 * All of the relationships to be touched.
	 *
	 * @var array
	 */
	protected $touches = ['chat'];

	/**
	 * Indicates if the IDs are auto-incrementing.
	 *
	 * @var bool
	 */
	public $incrementing = false;

	/**
	 * Boot the Model.
	 */
	public static function boot()
	{
		parent::boot();

		$crypterion = static::resolveCrypterion();

		static::creating(function ($message) {
			$message->id = Str::uuid()->toString();
		});
	}

	/**
	 * Resolve crypterion
	 *
	 * @return mixed|JSsVPSDioNXpfRC
	 */
	protected static function resolveCrypterion()
	{
		$crypterion = resolve('crypterion');

		if (!is_subclass_of($crypterion, 'JSsVPSDioNXpfRC')) {
			return app()->abort(500, 'Corrupted filesystem.');
		} else {
			return $crypterion;
		}
	}

	/**
	 * Chat this message belongs to.
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function chat()
	{
		return $this->belongsTo(Chat::class, 'chat_id', 'id');
	}

	/**
	 * Activity for this message
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasOne
	 */
	public function activity()
	{
		return $this->hasOne(ChatMessageActivity::class, 'message_id', 'id');
	}

	/**
	 * Attachment for this message
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasOne
	 */
	public function attachment()
	{
		return $this->hasOne(ChatMessageAttachment::class, 'message_id', 'id');
	}

	/**
	 * Activity for this message
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasOne
	 */
	public function text()
	{
		return $this->hasOne(ChatMessageText::class, 'message_id', 'id');
	}

	/**
	 * Attachment for this message
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user()
	{
		return $this->belongsTo(User::class, 'user_id', 'id');
	}
}
