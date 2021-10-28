<?php
/**
 * ======================================================================================================
 * File Name: UserPreferredChannels.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 10/19/2019 (3:09 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Notifications;


use App\Models\User;
use Exception;

trait PreferredChannels
{
	/**
	 * @param User $notifiable
	 * @return null|array
	 * @throws Exception
	 */
	public function preferredChannels($notifiable)
	{
		if (!($notifiable instanceof User)) return null;

		$settings = collect($notifiable->getNotificationSettings())
			->where('name', $this->settingsName())->first();

		if (!$settings) return null;

		$channels = [];

		if (isset($settings['sms']) && $settings['sms']) {
			array_push($channels, getSmsChannel());
		}

		if (isset($settings['database']) && $settings['database']) {
			array_push($channels, 'database');
		}

		if (isset($settings['email']) && $settings['email']) {
			array_push($channels, 'mail');
		}

		return $channels;
	}

	/**
	 * Get notification name
	 *
	 * @return string
	 * @throws Exception
	 */
	protected function settingsName()
	{
		if (!property_exists($this, 'name')) {
			throw new Exception("Missing name property on notification.");
		}

		if (!is_string($this->name)) {
			throw new Exception("Invalid property type for notification name.");
		}

		return $this->name;
	}

}
