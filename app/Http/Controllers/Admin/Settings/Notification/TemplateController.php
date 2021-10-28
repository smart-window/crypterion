<?php

namespace App\Http\Controllers\Admin\Settings\Notification;

use App\Models\NotificationTemplate;
use App\Notifications\Auth\UserActivated;
use App\Notifications\Auth\UserDeactivated;
use App\Notifications\Auth\UserDeleted;
use App\Notifications\Auth\UserRegistered;
use App\Notifications\Marketplace\TradeCancelled;
use App\Notifications\Marketplace\TradeCompleted;
use App\Notifications\Marketplace\TradeDisputed;
use App\Notifications\Marketplace\TradeMarkedAsPaid;
use App\Notifications\Marketplace\TradeReceivedRating;
use App\Notifications\Marketplace\TradeStarted;
use App\Notifications\Verification\EmailVerificationToken;
use App\Notifications\Verification\PhoneVerificationToken;
use App\Notifications\Wallet\ConfirmedReceive;
use App\Notifications\Wallet\UnconfirmedReceive;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TemplateController extends Controller
{
	/**
	 * Get notifications data
	 *
	 * @throws \Throwable
	 */
	public function list()
	{
		return collect($this->notifications())
			->map(function ($notification) {
				$template = $notification->template()
					->loadMissing(['smsMessages', 'databaseMessages', 'emailMessages']);

				$data = array_filter($template->toArray());

				if (method_exists($notification, 'parameterNames')) {
					$data['parameters'] = collect($notification->parameterNames())
						->map(function ($value, $key) {
							return ['name' => $value, 'key' => $key];
						})->values()->toArray();
				}
				return $data;
			});
	}

	/**
	 * Validate sms message attribute
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateSmsMessage(Request $request)
	{
		$this->validate($request, [
			'locale'  => 'required|string',
			'content' => 'required|string|max:150',
		]);
	}

	/**
	 * Validate database message attribute
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateDatabaseMessage(Request $request)
	{
		$this->validate($request, [
			'locale'  => 'required|string',
			'subject' => 'required|string|max:70',
			'message' => 'required|string|max:150',
		]);
	}

	/**
	 * Validate email message attribute
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateEmailMessage(Request $request)
	{
		$this->validate($request, [
			'locale'  => 'required|string',
			'subject' => 'required|string|max:250',
			'body'    => 'required|string',
		]);
	}

	/**
	 * Update sms message
	 *
	 * @param Request $request
	 * @param NotificationTemplate $template
	 * @return \Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Relations\HasMany
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function updateSmsMessage(Request $request, NotificationTemplate $template)
	{
		$this->validateSmsMessage($request);
		$locale = $request->get("locale");

		$message = $template->smsMessages()
			->where("locale", $locale)->firstOrFail();

		$message->update([
			'content' => $request->get('content')
		]);
		return $message;
	}

	/**
	 * Update database message
	 *
	 * @param Request $request
	 * @param NotificationTemplate $template
	 * @return \Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Relations\HasMany
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function updateDatabaseMessage(Request $request, NotificationTemplate $template)
	{
		$this->validateDatabaseMessage($request);
		$locale = $request->get("locale");

		$message = $template->databaseMessages()
			->where("locale", $locale)->firstOrFail();

		$message->update([
			'subject' => $request->get('subject'),
			'message' => $request->get('message')
		]);
		return $message;
	}

	/**
	 * Update email message
	 *
	 * @param Request $request
	 * @param NotificationTemplate $template
	 * @return \Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Relations\HasMany
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function updateEmailMessage(Request $request, NotificationTemplate $template)
	{
		$this->validateEmailMessage($request);
		$locale = $request->get("locale");

		$message = $template->emailMessages()
			->where("locale", $locale)->firstOrFail();

		$message->update([
			'subject' => $request->get('subject'),
			'body'    => $request->get('body')
		]);
		return $message;
	}

	/**
	 * Editable template notifications
	 *
	 * @return array
	 * @throws \Throwable
	 */
	protected function notifications()
	{
		return [
			new UserActivated(),
			new UserDeactivated(),
			new UserDeleted(),
			new UserRegistered(),
			new TradeCancelled(),
			new TradeCompleted(),
			new TradeDisputed(),
			new TradeMarkedAsPaid(),
			new TradeReceivedRating(),
			new TradeStarted(),
			new EmailVerificationToken(),
			new PhoneVerificationToken(),
			new ConfirmedReceive(),
			new UnconfirmedReceive()
		];
	}
}
