<?php

namespace App\Notifications\Test;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class EmailTest extends Notification
{
	/**
	 * Email subject
	 *
	 * @var string
	 */
	protected $subject = 'Email Channel Test';

	/**
	 * Email body
	 *
	 * @var string
	 */
	protected $body = 'This is a test email sent from {app_name} as an attempt to enable the email notification channel.';

	/**
	 * Get the notification's delivery channels.
	 *
	 * @param mixed $notifiable
	 * @return array
	 */
	public function via($notifiable)
	{
		return ["mail"];
	}

	/**
	 * Get the mail representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return \Illuminate\Notifications\Messages\MailMessage
	 */
	public function toMail($notifiable)
	{
		$replacement = $this->parameters($notifiable);

		return (new MailMessage)
			->subject($this->makeReplacements($this->subject, $replacement))
			->view('email', [
				'body' => $this->makeReplacements($this->body, $replacement)
			]);
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
