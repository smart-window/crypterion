<?php
/**
 * ======================================================================================================
 * File Name: ChatMessage.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 10/15/2019 (11:09 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Helpers;


use App\Events\NewChatMessage;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatMessageActivity;
use App\Models\ChatMessageAttachment;
use App\Models\ChatMessageText;
use App\Models\User;

class ChatMessageHelper
{
	/**
	 * @var \App\Models\ChatMessage
	 */
	protected $message;

	/**
	 * @var User
	 */
	protected $user;

	/**
	 * @var ChatMessageAttachment|ChatMessageText|ChatMessageActivity
	 */
	protected $content;

	/**
	 * ChatMessageHelper constructor.
	 * @param string $type
	 * @throws \Exception
	 */
	public function __construct(string $type)
	{
		if (!in_array($type, ['text', 'attachment', 'activity'])) {
			throw new \Exception("Invalid message type.");
		}

		$this->message = new ChatMessage(['type' => $type]);
	}

	/**
	 * Set User
	 *
	 * @param User $user
	 * @return ChatMessageHelper
	 */
	public function by(User $user)
	{
		$this->message->user()->associate($user);
		return $this;
	}

	/**
	 * Set the message content
	 *
	 * @param $content
	 * @return $this
	 */
	public function content($content)
	{
		switch ($this->message->type) {
			case 'activity':
				$this->content = new ChatMessageActivity($content);
				break;

			case 'text':
				$this->content = new ChatMessageText($content);
				break;

			case 'attachment':
				$this->content = new ChatMessageAttachment($content);
				break;
		}
		return $this;
	}

	/**
	 * Save message
	 *
	 * @param Chat $chat
	 * @return ChatMessage|null
	 */
	public function save(Chat $chat)
	{
		$chat->messages()->save($this->message);

		switch ($this->message->type) {
			case 'activity':
				$this->message->activity()->save($this->content);
				break;

			case 'text':
				$this->message->text()->save($this->content);
				break;

			case 'attachment':
				$this->message->attachment()->save($this->content);
				break;
		}

		$chat->touch();

		broadcast(new NewChatMessage($this->message));

		return $this->message->fresh();
	}
}