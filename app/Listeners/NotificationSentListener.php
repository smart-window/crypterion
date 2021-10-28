<?php

namespace App\Listeners;

use App\Events\UserNotificationsStatusChanged;
use App\Models\User;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class NotificationSentListener
{
	/**
	 * Handle User notification
	 *
	 * @param NotificationSent $event
	 */
	public function handleUserNotification($event)
	{
		if ($event->channel == 'database') {
			broadcast(new UserNotificationsStatusChanged($event->notifiable));
		}
	}

	/**
	 * Handle the event.
	 *
	 * @param NotificationSent $event
	 * @return void
	 */
	public function handle(NotificationSent $event)
	{
		if ($event->notifiable instanceof User) {
			$this->handleUserNotification($event);
		}
	}
}
