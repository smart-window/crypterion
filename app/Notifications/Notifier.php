<?php
/**
 * ======================================================================================================
 * File Name: Notifier.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 9/10/2019 (8:59 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Notifications;


use App\Models\NotificationDatabaseMessage;
use App\Models\NotificationEmailMessage;
use App\Models\NotificationSmsMessage;
use App\Models\NotificationTemplate;
use App\Notifications\Messages\AfricasTalkingMessage;
use App\Notifications\Messages\TwilioMessage;
use Exception;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\NexmoMessage;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

trait Notifier
{
	/**
	 * Notification Template
	 *
	 * @var NotificationTemplate
	 */
	protected $template;

	/**
	 * Get the notifiable's preferred locale for the notification.
	 *
	 * @param mixed $notifiable
	 * @param mixed $notification
	 * @return string|null
	 */
	protected function preferredLocale($notifiable)
	{
		return $this->locale ??
			value(function () use ($notifiable) {
				if ($notifiable instanceof HasLocalePreference) {
					return $notifiable->preferredLocale();
				}
				return null;
			});
	}

	/**
	 * Default system locale
	 *
	 * @return mixed
	 */
	protected function fallbackLocale()
	{
		return config()->get('app.locale');
	}

	/**
	 * Check the email channel status for this notification
	 *
	 * @return bool
	 */
	public function allowEmailChannel()
	{
		return !($this->disableEmailChannel ?? false);
	}

	/**
	 * Check the database channel status for this notification
	 *
	 * @return bool
	 */
	public function allowDatabaseChannel()
	{
		return !($this->disableDatabaseChannel ?? false);
	}

	/**
	 * Check the sms channel status for this notification
	 *
	 * @return bool
	 */
	public function allowSmsChannel()
	{
		return !($this->disableSmsChannel ?? false);
	}

	/**
	 * Check if notification can be sent to email
	 *
	 * @return bool
	 */
	public function canNotifyEmail()
	{
		return settings('notification')->enable_email &&
			$this->allowEmailChannel();
	}

	/**
	 * Check if notification can be sent to database
	 *
	 * @return bool
	 */
	public function canNotifyDatabase()
	{
		return settings('notification')->enable_database &&
			$this->allowDatabaseChannel();
	}

	/**
	 * Check if notification can be sent to sms
	 *
	 * @return bool
	 */
	public function canNotifySms()
	{
		return settings('notification')->enable_sms &&
			$this->allowSmsChannel();
	}

	/**
	 * Get the notification's delivery channels.
	 *
	 * @param mixed $notifiable
	 * @return array
	 */
	public function via($notifiable)
	{
		$channels = [];
		if ($this->canNotifyDatabase()) {
			array_push($channels, 'database');
		}

		if ($this->canNotifyEmail()) {
			array_push($channels, 'mail');
		}

		if ($this->canNotifySms()) {
			array_push($channels, getSmsChannel());
		}

		if (method_exists($this, 'preferredChannels')) {
			$preferred = $this->preferredChannels($notifiable);
			if (is_array($preferred)) {
				$channels = array_intersect($channels, $preferred);
			}
		}
		return $channels;
	}

	/**
	 * Get the mail representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return \Illuminate\Notifications\Messages\MailMessage
	 */
	public function toMail($notifiable)
	{
		$locale = $this->preferredLocale($notifiable);
		$replacement = $this->replacements($notifiable);

		$message = $this->emailMessage($locale);

		return (new MailMessage)
			->subject($this->makeReplacements($message->subject, $replacement))
			->view('email', [
				'body' => $this->makeReplacements($message->body, $replacement)
			]);
	}

	/**
	 * Get the Nexmo / SMS representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return NexmoMessage
	 */
	public function toNexmo($notifiable)
	{
		$locale = $this->preferredLocale($notifiable);
		$replacement = $this->replacements($notifiable);

		$message = $this->smsMessage($locale);

		return (new NexmoMessage())
			->content($this->makeReplacements($message->content, $replacement));
	}

	/**
	 * Get the AfricasTalking representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return AfricasTalkingMessage
	 */
	public function toAfricasTalking($notifiable)
	{
		$locale = $this->preferredLocale($notifiable);
		$replacement = $this->replacements($notifiable);

		$message = $this->smsMessage($locale);

		return (new AfricasTalkingMessage())
			->content($this->makeReplacements($message->content, $replacement));
	}

	/**
	 * Get the Twilio representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return TwilioMessage
	 */
	public function toTwilio($notifiable)
	{
		$locale = $this->preferredLocale($notifiable);
		$replacement = $this->replacements($notifiable);

		$message = $this->smsMessage($locale);

		return (new TwilioMessage())
			->content($this->makeReplacements($message->content, $replacement));
	}

	/**
	 * Get the array representation of the notification.
	 *
	 * @param mixed $notifiable
	 * @return array
	 */
	public function toArray($notifiable)
	{
		$locale = $this->preferredLocale($notifiable);
		$replacement = $this->replacements($notifiable);

		$message = $this->databaseMessage($locale);

		return [
			'subject'    => $this->makeReplacements($message->subject, $replacement),
			'message'    => $this->makeReplacements($message->message, $replacement),
			'parameters' => $replacement
		];
	}

	/**
	 * Get email message by locale
	 *
	 * @param null $locale
	 * @return NotificationEmailMessage
	 */
	protected function emailMessage($locale = null)
	{
		$default = $this->loadEmailMessage();

		if (is_null($locale) || $locale == $default->locale) {
			return $default;
		}

		$template = $this->template();

		return $template->emailMessages()
				->where('locale', $locale)->first()
			?: $default;
	}

	/**
	 * Load default email message
	 *
	 * @param NotificationTemplate $template
	 * @return NotificationEmailMessage|false|\Illuminate\Database\Eloquent\Model
	 */
	protected function loadEmailMessage()
	{
		$default = $this->defaultEmailMessage();
		if (!$this->allowEmailChannel()) return $default;

		$template = $this->template();

		$message = $template->emailMessages()
			->where('locale', $default->locale)
			->first();

		return $message ?:
			$template->emailMessages()->save($default);
	}


	/**
	 * Get database message by locale
	 *
	 * @param null $locale
	 * @return NotificationDatabaseMessage
	 */
	protected function databaseMessage($locale = null)
	{
		$default = $this->loadDatabaseMessage();

		if (is_null($locale) || $locale == $default->locale) {
			return $default;
		}

		$template = $this->template();

		return $template->databaseMessages()
				->where('locale', $locale)->first()
			?: $default;
	}

	/**
	 * Load default database message
	 *
	 * @param NotificationTemplate $template
	 * @return NotificationDatabaseMessage|false|\Illuminate\Database\Eloquent\Model
	 */
	protected function loadDatabaseMessage()
	{
		$default = $this->defaultDatabaseMessage();
		if (!$this->allowDatabaseChannel()) return $default;

		$template = $this->template();

		$message = $template->databaseMessages()
			->where('locale', $default->locale)
			->first();

		return $message ?:
			$template->databaseMessages()->save($default);
	}

	/**
	 * Get sms message by locale
	 *
	 * @param null $locale
	 * @return NotificationSmsMessage
	 */
	protected function smsMessage($locale = null)
	{
		$default = $this->loadSmsMessage();

		if (is_null($locale) || $locale == $default->locale) {
			return $default;
		}

		$template = $this->template();

		return $template->smsMessages()
				->where('locale', $locale)->first()
			?: $default;
	}


	/**
	 * Load default sms message
	 *
	 * @param NotificationTemplate $template
	 * @return NotificationSmsMessage|false|\Illuminate\Database\Eloquent\Model
	 */
	protected function loadSmsMessage()
	{
		$default = $this->defaultSmsMessage();
		if (!$this->allowSmsChannel()) return $default;

		$template = $this->template();

		$message = $template->smsMessages()
			->where('locale', $default->locale)
			->first();

		return $message ?:
			$template->smsMessages()->save($default);
	}

	/**
	 * Get notification template
	 *
	 * @return NotificationTemplate|null
	 */
	public function template()
	{
		if (!isset($this->template)) {
			$name = $this->templateName();

			$this->template = NotificationTemplate::where('name', $name)
				->latest()
				->firstOr(function () use ($name) {
					return $this->createTemplate($name);
				});
		}
		return $this->template;
	}

	/**
	 * Get template for this notification
	 * This is called by database seeder.
	 *
	 * @param $name
	 * @return null|NotificationTemplate
	 * @throws \Throwable
	 */
	protected function createTemplate($name)
	{
		return DB::transaction(function () use ($name) {
			$template = NotificationTemplate::create(['name' => $name]);

			if ($this->allowDatabaseChannel()) {
				$template->databaseMessages()->save($this->defaultDatabaseMessage());
			}

			if ($this->allowSmsChannel()) {
				$template->smsMessages()->save($this->defaultSmsMessage());
			}

			if ($this->allowEmailChannel()) {
				$template->emailMessages()->save($this->defaultEmailMessage());
			}

			return $template;
		});
	}

	/**
	 * @return NotificationSmsMessage
	 */
	protected function defaultSmsMessage()
	{
		$attributes = collect([
			'content' => trans('notification.missing_content'),
		]);

		$locale = $this->fallbackLocale();

		if (property_exists($this, 'smsMessage')) {
			$attributes = $attributes->merge($this->smsMessage);
		}

		$attributes->put('locale', $locale);
		$attributes = $attributes->only(['content', 'locale'])->all();

		return new NotificationSmsMessage($attributes);
	}

	/**
	 * @return NotificationDatabaseMessage
	 */
	protected function defaultDatabaseMessage()
	{
		$attributes = collect([
			'subject' => trans('notification.missing_content'),
			'message' => trans('notification.missing_content')
		]);

		$locale = $this->fallbackLocale();

		if (property_exists($this, 'databaseMessage')) {
			$attributes = $attributes->merge($this->databaseMessage);
		}

		$attributes->put('locale', $locale);
		$attributes = $attributes->only(['subject', 'message', 'locale'])->all();

		return new NotificationDatabaseMessage($attributes);
	}

	/**
	 * @return NotificationEmailMessage
	 */
	protected function defaultEmailMessage()
	{
		$attributes = collect([
			'subject' => trans('notification.missing_content'),
			'body'    => trans('notification.missing_content')
		]);

		$locale = $this->fallbackLocale();

		if (property_exists($this, 'emailMessage')) {
			$attributes = $attributes->merge($this->emailMessage);
		}

		$attributes->put('locale', $locale);
		$attributes = $attributes->only(['subject', 'body', 'locale'])->all();

		return new NotificationEmailMessage($attributes);
	}

	/**
	 * @param $notifiable
	 * @return array
	 */
	protected function replacements($notifiable)
	{
		if (!method_exists($this, 'parameters')) {
			return [];
		}
		return $this->parameters($notifiable);
	}

	//	/**
	//	 * @param $notifiable
	//	 * @return array
	//	 */
	//	public function getParameterNames($notifiable)
	//	{
	//		if (!method_exists($this, 'parameters')) {
	//			return [];
	//		}
	//		return collect($this->parameters($notifiable))
	//			->mapWithKeys(function ($data, $key) {
	//				return ['{' . $key . '}' => $data['name'] ?? false];
	//			})->filter()->all();
	//	}

	/**
	 * Get template name
	 *
	 * @return mixed
	 * @throws Exception
	 */
	protected function templateName()
	{
		if (!property_exists($this, 'name')) {
			throw new Exception("Missing name property on notification.");
		}

		if (!is_string($this->name)) {
			throw new Exception("Invalid property type for notification name.");
		}

		return $this->name;
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