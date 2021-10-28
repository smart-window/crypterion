<?php

namespace App\Models;

use App\Events\ChatParticipationChanged;
use App\Events\ChatUpdated;
use App\Http\Resources\ChatMessage as ChatMessageResource;
use App\Http\Resources\MarketplaceTrade as MarketplaceTradeResource;
use ArrayObject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use JSsVPSDioNXpfRC;

class Chat extends Model
{
	protected $lastMessageAttribute;
	protected $lastMarketplaceTradeAttribute;

	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * The event map for the model.
	 *
	 * @var array
	 */
	protected $dispatchesEvents = [
		'updated' => ChatUpdated::class
	];

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

		static::creating(function ($chat) {
			$chat->id = Str::uuid()->toString();
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
	 * Get the route key for the model.
	 *
	 * @return string
	 */
	public function getRouteKeyName()
	{
		return 'id';
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function creator()
	{
		return $this->belongsTo(User::class, 'creator_id', 'id');
	}

	/**
	 * Participants for this chat
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function participants()
	{
		return $this->hasMany(ChatParticipant::class, 'chat_id', 'id');
	}

	/**
	 * Messages for this chat
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function messages()
	{
		return $this->hasMany(ChatMessage::class, 'chat_id', 'id');
	}

	/**
	 * Update user's participation record
	 *
	 * @param User $user
	 */
	public function updateParticipation($user)
	{
		$this->participants()->where('user_id', $user->id)
			->update(['last_read_at' => now()]);

		broadcast(new ChatParticipationChanged($this, $user));
	}

	/**
	 * All marketplace trades hosted by this chat
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function marketplaceTrades()
	{
		return $this->hasMany(MarketplaceTrade::class, 'chat_id', 'id')
			->has('buyer')->has('seller');
	}

	/**
	 * @return Model|\Illuminate\Database\Eloquent\Relations\HasMany|mixed|object|null
	 */
	public function getLatestMarketplaceTrade()
	{
		if (!isset($this->lastMarketplaceTradeAttribute)) {
			$trade = $this->marketplaceTrades()->latest()->first();

			$this->lastMarketplaceTradeAttribute = new MarketplaceTradeResource($trade);
		}
		return $this->lastMarketplaceTradeAttribute;
	}

	/**
	 * Last chat message
	 *
	 * @return ChatMessageResource|ArrayObject|mixed
	 */
	public function getLatestMessage()
	{
		if (!isset($this->lastMessageAttribute)) {
			$message = $this->messages()->latest()->first();

			if ($message) {
				$this->lastMessageAttribute = new ChatMessageResource($message);
			} else {
				$this->lastMessageAttribute = new ArrayObject();
			}
		}
		return $this->lastMessageAttribute;
	}

	/**
	 * @param User $user
	 * @return array
	 */
	public function getParticipation($user)
	{
		$participant = $this->participants()
			->where('user_id', $user->id)->without('user')
			->first();

		$unreadMessagesCount = ($participant && $participant->last_read_at) ?
			$this->messages()->where('user_id', '!=', $user->id)
				->where('created_at', '>', $participant->last_read_at)
				->count() :
			$this->messages()->where('user_id', '!=', $user->id)
				->count();

		return [
			'user_id'               => $user->id,
			'unread_messages_count' => $unreadMessagesCount
		];
	}

	/**
	 * If user should be allowed in this chat
	 *
	 * @param User $user
	 * @return bool
	 */
	public function shouldAllowUser($user)
	{
		$isParticipant = $this->participants()
			->where('user_id', $user->id)->exists();
		return (
			$isParticipant ||
			$user->can('moderate_chats')
		);
	}

	/**
	 * @return string
	 */
	public function attachmentsDir()
	{
		return "chats/{$this->id}/message-attachments";
	}
}
