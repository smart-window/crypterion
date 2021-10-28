<?php

namespace App\Http\Controllers\Home\Widget;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MarketplaceStatisticsController extends Controller
{
	/**
	 * Get trade status data
	 *
	 * @return mixed
	 */
	public function tradeStatusData()
	{
		$results = Auth::user()->marketplaceTrades()
			->select('status', DB::raw('COUNT(*) as total'))
			->groupBy('status')->get()
			->pluck('total', 'status');

		return collect([
			'active'     => $results->get('active', 0),
			'successful' => $results->get('successful', 0),
			'cancelled'  => $results->get('cancelled', 0),
			'dispute'    => $results->get('dispute', 0),
		])->map(function ($value, $name) {
			return ['name'  => $name, 'value' => $value];
		})->values();
	}
}
