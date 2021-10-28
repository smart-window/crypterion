<?php

namespace App\Http\Controllers\Admin\Home\Widget;

use App\Models\MarketplaceCharge;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class StatisticsController extends Controller
{
	/**
	 * Get total users
	 *
	 * @return array
	 */
	public function totalUsers()
	{
		return [
			'total' => User::count()
		];
	}

	/**
	 * Get total earnings
	 *
	 * @return array
	 */
	public function totalEarnings()
	{
		$currency = Auth::user()->currency;
		$totalEarnings = $this->calcTotalEarnings($currency);

		return [
			'total_earnings'           => $totalEarnings,
			'formatted_total_earnings' => currency_format($totalEarnings, $currency),
			'currency'                 => $currency
		];
	}

	/**
	 * Calculate total earnings.
	 *
	 * @param $currency
	 * @return float|double|int
	 */
	protected function calcTotalEarnings($currency)
	{
		$totalDollarAmount = MarketplaceCharge::sum('dollar_amount');
		return currency($totalDollarAmount, 'USD', $currency);
	}
}
