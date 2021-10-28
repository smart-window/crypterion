<?php

namespace App\Notifications\Test;

use App\Notifications\Messages\AfricasTalkingMessage;
use App\Notifications\Messages\TwilioMessage;
use Illuminate\Notifications\Messages\NexmoMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class SmsTest extends Notification
{
	/**
	 * Default sms message attributes
	 *
	 * @var string
	 */
	protected $content = 'This is a test sms sent from {app_name} as an attempt to enable the sms notification channel.';

	/**
	 * Get the notification's delivery channels.
	 *
	 * @param mixed $notifiable
	 * @return array
	 */
	public function via($notifiable)
	{
		return [getSmsChannel()];
	}

	/**
	 * Get the Nexmo / SMS representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return NexmoMessage
	 */
	public function toNexmo($notifiable)
	{
		$replacement = $this->parameters($notifiable);
		$content = $this->content;

		return (new NexmoMessage())
			->content($this->makeReplacements($content, $replacement));
	}

	/**
	 * Get the AfricasTalking representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return AfricasTalkingMessage
	 */
	public function toAfricasTalking($notifiable)
	{
		$replacement = $this->parameters($notifiable);
		$content = $this->content;

		return (new AfricasTalkingMessage())
			->content($this->makeReplacements($content, $replacement));
	}

	/**
	 * Get the Twilio representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return TwilioMessage
	 */
	public function toTwilio($notifiable)
	{
		$replacement = $this->parameters($notifiable);
		$content = $this->content;

		return (new TwilioMessage())
			->content($this->makeReplacements($content, $replacement));
	}

	/**
	 *  Replacement Parameters and Values
	 *
	 * @param $notifiable
	 * @return array
	 */
	public function parameters($notifiable)
	{
		return [
			'app_name'  => config('app.name'),
			'user_name' => $notifiable->name,
		];
	}

	/**
	 * Make the place-holder replacements on a line.
	 *
	 * @param string $line
	 * @param $replace
	 * @return string
	 */
	protected function makeReplacements($line, $replace)
	{
		$line = (string) $line;

		if (empty($replace)) {
			return $line;
		}

		$replace = $this->sortReplacements($replace);

		foreach ($replace as $key => $value) {
			$line = str_replace(
				['{' . $key . '}', '{' . Str::upper($key) . '}', '{' . Str::ucfirst($key) . '}'],
				[$value, Str::upper($value), Str::ucfirst($value)],
				$line
			);
		}
		return $line;
	}

	/**
	 * Sort the replacements array.
	 *
	 * @param array $replace
	 * @return array
	 */
	protected function sortReplacements(array $replace)
	{
		return (new Collection($replace))->sortBy(function ($value, $key) {
			return mb_strlen($key) * -1;
		})->all();
	}
}
