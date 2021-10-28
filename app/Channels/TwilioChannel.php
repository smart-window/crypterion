<?php

namespace App\Channels;

use App\Models\User;
use App\Notifications\Messages\TwilioMessage;
use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;

class TwilioChannel
{
	/**
	 * Twilio Configuration
	 *
	 * @var array
	 */
	protected $config;

	/**
	 * Create a new channel instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->config = config()->get('services.twilio');
	}

	/**
	 * Returns an instance of the driver
	 *
	 * @return Client
	 * @throws \Twilio\Exceptions\ConfigurationException
	 */
	protected function instance()
	{
		return new Client(
			$this->config['id'],
			$this->config['token']
		);
	}

	/**
	 * Send the given notification.
	 *
	 * @param mixed|User $notifiable
	 * @param \Illuminate\Notifications\Notification $notification
	 * @throws \Twilio\Exceptions\ConfigurationException
	 * @throws \Twilio\Exceptions\TwilioException
	 */
	public function send($notifiable, Notification $notification)
	{
		if (!$to = $notifiable->phone) {
			return;
		}

		$message = $notification->toTwilio($notifiable);

		if (is_string($message)) {
			$message = new TwilioMessage($message);
		}

		$this->instance()->messages->create(
			$to, [
				'from' => $message->from ?: $this->config['number'],
				'body' => trim($message->content)
			]
		);
	}

}
