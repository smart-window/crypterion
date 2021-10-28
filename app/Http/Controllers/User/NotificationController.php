<?php

namespace App\Http\Controllers\User;

use App\Events\UserNotificationsStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
	/**
	 * Get notification status
	 *
	 * @return array
	 */
	public function status()
	{
		return Auth::user()->getNotificationsStatus();
	}

	/**
	 * Update user's notifications status
	 */
	public function updateStatus()
	{
		Auth::user()->update([
			'notifications_read_at' => now()
		]);

		broadcast(new UserNotificationsStatusChanged(Auth::user()));
	}

	/**
	 * Paginate notifications
	 *
	 * @param Request $request
	 * @return mixed
	 */
	public function table(Request $request)
	{
		$notifications = Auth::user()
			->notifications()->latest();

		return paginateResult(
			$notifications,
			$request->get('itemPerPage', 10),
			$request->get('page')
		);
	}

	/**
	 * Mark notification as read
	 *
	 * @param Request $request
	 * @param Notification $notification
	 * @return Notification
	 */
	public function markAsRead(Notification $notification)
	{
		$notification->markAsRead();
		return $notification;
	}

	/**
	 * Mark all unread notifications as read
	 */
	public function markAllAsRead()
	{
		Auth::user()->unreadNotifications()
			->update(['read_at' => now()]);
	}
}
