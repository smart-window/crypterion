<?php

use App\Models\Widget;
use Illuminate\Database\Seeder;

class WidgetsTableSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		$this->seedIndexHome();
		$this->seedAdminHome();
	}

	/**
	 * Seed Index Home widgets
	 *
	 * @return \Illuminate\Support\Collection
	 */
	protected function seedIndexHome()
	{
		$widgets = [
			'bitcoin_price' => [
				'cols'      => 1,
				'resizable' => false,
				'rows'      => 1,
				'order'     => 0
			],

			'litecoin_price' => [
				'cols'      => 1,
				'resizable' => false,
				'rows'      => 1,
				'order'     => 1
			],

			'dash_price' => [
				'cols'      => 1,
				'resizable' => false,
				'rows'      => 1,
				'order'     => 2
			],

			'zcash_price' => [
				'cols'      => 1,
				'resizable' => false,
				'enabled'   => false,
				'rows'      => 1,
				'order'     => 8
			],

			'ethereum_price' => [
				'cols'      => 1,
				'resizable' => false,
				'enabled'   => false,
				'rows'      => 1,
				'order'     => 8
			],

			'bitcoin_cash_price' => [
				'cols'      => 1,
				'resizable' => false,
				'rows'      => 1,
				'order'     => 3
			],

			'marketplace_buy' => [
				'cols'     => 2,
				'min_cols' => 2,
				'rows'     => 3,
				'min_rows' => 3,
				'order'    => 4
			],

			'marketplace_sell' => [
				'cols'     => 2,
				'min_cols' => 2,
				'rows'     => 3,
				'min_rows' => 3,
				'order'    => 6
			],

			'active_trades' => [
				'cols'     => 2,
				'min_cols' => 2,
				'rows'     => 3,
				'min_rows' => 3,
				'order'    => 5
			],

			'trade_status_chart' => [
				'cols'     => 2,
				'max_cols' => 2,
				'rows'     => 3,
				'max_rows' => 3,
				'order'    => 4
			],

			'authentication' => [
				'cols'     => 2,
				'min_cols' => 2,
				'max_cols' => 2,
				'rows'     => 3,
				'min_rows' => 3,
				'order'    => 7
			]
		];

		return collect($widgets)
			->map(function ($data, $name) {
				return Widget::updateOrCreate([
					'category' => 'index.home',
					'name'     => $name,
				], $data);
			});
	}

	/**
	 * Seed Admin Home widgets
	 *
	 * @return \Illuminate\Support\Collection
	 */
	protected function seedAdminHome()
	{
		$widgets = [
			'welcome_card' => [
				'cols'     => 1,
				'max_cols' => 2,
				'rows'     => 3,
				'max_rows' => 3,
				'min_rows' => 3,
				'order'    => 0
			],

			'marketplace_statistics' => [
				'cols'      => 1,
				'resizable' => false,
				'rows'      => 2,
				'order'     => 1
			],

			'total_users' => [
				'cols'      => 1,
				'resizable' => false,
				'rows'      => 1,
				'order'     => 5
			],

			'total_revenue' => [
				'cols'      => 1,
				'resizable' => false,
				'rows'      => 1,
				'order'     => 6
			],

			'marketplace_earnings_chart' => [
				'cols'      => 2,
				'resizable' => false,
				'rows'      => 3,
				'order'     => 3
			],

			'failed_jobs' => [
				'cols'      => 2,
				'resizable' => false,
				'rows'      => 3,
				'order'     => 4
			],

			'user_registrations_chart' => [
				'cols'      => 2,
				'resizable' => false,
				'rows'      => 3,
				'order'     => 2
			],
		];

		return collect($widgets)
			->map(function ($data, $name) {
				return Widget::updateOrCreate([
					'category' => 'admin.home',
					'name'     => $name,
				], $data);
			});
	}
}
