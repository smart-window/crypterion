<?php

namespace App\Http\Controllers\Admin\Home\Widget;

use App\Models\MarketplaceCharge;
use App\Models\MarketplaceOffer;
use App\Models\MarketplaceTrade;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MarketplaceStatisticsController extends Controller
{
	/**
	 * Get marketplace statistics data
	 *
	 * @return array
	 */
	public function data()
	{
		$tradesCount = DB::table('marketplace_trades')->select('status')
			->selectRaw('count(*) as total')->groupBy('status')
			->get()->pluck('total', 'status');

		return [
			'total_offers'            => MarketplaceOffer::count(),
			'total_active_trades'     => $tradesCount->get('active', 0),
			'total_successful_trades' => $tradesCount->get('successful', 0),
			'total_cancelled_trades'  => $tradesCount->get('cancelled', 0),
			'total_dispute_trades'    => $tradesCount->get('dispute', 0)
		];
	}

	/**
	 * Get earnings data
	 *
	 * @param Request $request
	 * @return \Illuminate\Support\Collection
	 */
	public function earningsByDateData(Request $request)
	{
		$query = DB::table('marketplace_charges')
			->selectRaw('SUM(dollar_amount) as amount');

		switch ($request->get('type', 'month')) {
			case 'year':
				$query->selectRaw('MONTHNAME(created_at) as date')
					->where('created_at', '>=', now()->subMonths(12))
					->groupBy('date');
				break;
			case 'month':
				$query->selectRaw('DAYOFMONTH(created_at) as date')
					->where('created_at', '>=', now()->subMonths(1))
					->groupBy('date');
		}

		$currency = Auth::user()->currency;

		return $query->get()
			->map(function ($data) use ($currency) {
				$data->amount = currency($data->amount, 'USD', $currency);
				return $data;
			});
	}
}
