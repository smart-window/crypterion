<?php

namespace App\Models;

use App\Events\ChatParticipantCreated;
use Illuminate\Database\Eloquent\Model;

class ChatParticipant extends Model
{
	protected $unreadMessagesCountAttribute;

	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * The attributes that should be mutated to dates.
	 *
	 * @var array
	 */
	protected $dates = [
		'last_read_at',
	];

	/**
	 * The event map for the model.
	 *
	 * @var array
	 */
	protected $dispatchesEvents = [
		'created' => ChatParticipantCreated::class,
	];

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
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user()
	{
		return $this->belongsTo(User::class, 'user_id', 'id');
	}

}
