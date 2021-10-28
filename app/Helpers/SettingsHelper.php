<?php
/**
 * ======================================================================================================
 * File Name: SettingsHelper.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 9/11/2019 (8:05 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Helpers;


use App\Models\BrandSetting;
use App\Models\MarketplaceSetting;
use App\Models\NotificationSetting;
use App\Models\PageSetting;
use App\Models\TemplateSetting;

class SettingsHelper
{
	protected $branch = '1.0';

	/**
	 * @var PageSetting
	 */
	protected $page;

	/**
	 * @var MarketplaceSetting
	 */
	protected $marketplace;

	/**
	 * @var TemplateSetting
	 */
	protected $template;

	/**
	 * @var NotificationSetting
	 */
	protected $notification;

	/**
	 * @var BrandSetting
	 */
	protected $brand;

	/**
	 * Get page settings
	 *
	 * @return PageSetting
	 */
	public function page()
	{
		if (!isset($this->page)) {
			$this->page = PageSetting::latest()
				->firstOrCreate(
					['branch' => $this->branch],
					$this->pageAttributes()
				);
		}
		return $this->page;
	}

	/**
	 * Get the default attributes for this branch
	 *
	 * @return array
	 */
	protected function pageAttributes()
	{
		return [];
	}

	/**
	 * Get marketplace settings
	 *
	 * @return MarketplaceSetting
	 */
	public function marketplace()
	{
		if (!isset($this->marketplace)) {
			$this->marketplace = MarketplaceSetting::latest()
				->firstOrCreate(
					['branch' => $this->branch],
					$this->marketplaceAttributes()
				);
		}
		return $this->marketplace;
	}

	/**
	 * Get the default attributes for this branch
	 *
	 * @return array
	 */
	protected function marketplaceAttributes()
	{
		$attributes = [
			'min_offer_amount'   => 1,
			'max_offer_amount'   => 10000,
			'offer_cache_period' => 5,
		];

		$keys = array_keys($attributes);

		if ($previous = MarketplaceSetting::latest()->first()) {
			$attributes = array_merge($attributes, $previous->toArray());
		}

		return array_only($attributes, $keys);
	}

	/**
	 * Get template settings
	 *
	 * @return TemplateSetting
	 */
	public function template()
	{
		if (!isset($this->template)) {
			$this->template = TemplateSetting::latest()
				->firstOrCreate(
					['branch' => $this->branch],
					$this->templateAttributes()
				);
		}
		return $this->template;
	}

	/**
	 * Get the default attributes for this branch
	 *
	 * @return array
	 */
	protected function templateAttributes()
	{
		$attributes = [
			'color_palettes' => [
				'@primary-color'            => '#b35e05',
				'@secondary-color'          => '#F18805',
				'@layout-header-background' => '#EAEBDD',
				'@layout-footer-background' => '#F3F3E6',
				'@hor-nav-text-color'       => '#000000',
				'@nav-dark-bg'              => '#272932',
				'@nav-dark-text-color'      => '#ABA895',
			],
			'layout_type'    => 'LAYOUT_TYPE_FULL',
			'nav_style'      => 'NAV_STYLE_VERTICAL_FIXED',
			'theme_type'     => 'THEME_TYPE_LITE',
		];

		$keys = array_keys($attributes);

		if ($previous = TemplateSetting::latest()->first()) {
			$attributes = array_merge($attributes, $previous->toArray());
		}

		return array_only($attributes, $keys);
	}

	/**
	 * Get exchange settings
	 *
	 * @return NotificationSetting
	 */
	public function notification()
	{
		if (!isset($this->notification)) {
			$this->notification = NotificationSetting::latest()
				->firstOrCreate(
					['branch' => $this->branch],
					$this->notificationAttributes()
				);
		}
		return $this->notification;
	}

	/**
	 * Get the default attributes for this branch
	 *
	 * @return array
	 */
	protected function notificationAttributes()
	{
		return [];
	}

	/**
	 * Get brand settings
	 *
	 * @return BrandSetting
	 */
	public function brand()
	{
		if (!isset($this->brand)) {
			$this->brand = BrandSetting::latest()
				->firstOrCreate(
					['branch' => $this->branch],
					$this->brandAttributes()
				);
		}
		return $this->brand;
	}

	/**
	 * Get the default attributes for this branch
	 *
	 * @return array
	 */
	protected function brandAttributes()
	{
		return [];
	}
}