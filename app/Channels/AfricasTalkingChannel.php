<?php

namespace App\Channels;

use AfricasTalking\SDK\AfricasTalking;
use App\Models\User;
use App\Notifications\Messages\AfricasTalkingMessage;
use Illuminate\Notifications\Notification;

class AfricasTalkingChannel
{

	/**
	 * Africas Talking API Key
	 *
	 * @var mixed
	 */
	protected $config;

	/**
	 * Create an AfricasTalking channel
	 *
	 * AfricasTalkingChannel constructor.
	 */
	public function __construct()
	{
		$this->config = config()->get('services.africastalking');
	}

	/**
	 * Returns an instance of the driver
	 *
	 * @return AfricasTalking
	 */
	protected function instance()
	{
		return new AfricasTalking(
			$this->config['username'],
			$this->config['key']
		);
	}

	/**
	 * Send the given notification.
	 *
	 * @param mixed|User $notifiable
	 * @param \Illuminate\Notifications\Notification $notification
	 * @return void
	 */
	public function send($notifiable, Notification $notification)
	{
		if (!$to = $notifiable->phone) {
			return;
		}

		$message = $notification->toAfricasTalking($notifiable);

		if (is_string($message)) {
			$message = new AfricasTalkingMessage($message);
		}

		$this->instance()->sms()->send([
			'from'    => $message->from ?: $this->config['from'],
			'to'      => $to,
			'enqueue' => $this->config['enqueue'],
			'message' => trim($message->content)
		]);
	}
}
