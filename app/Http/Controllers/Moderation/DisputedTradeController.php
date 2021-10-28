<?php

namespace App\Http\Controllers\Moderation;

use App\Http\Resources\MarketplaceTrade as MarketplaceTradeResource;
use App\Models\MarketplaceTrade;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DisputedTradeController extends Controller
{
	/**
	 * Create a new controller instance.
	 */
	public function __construct()
	{
		$this->middleware('permission:manage_marketplace');
	}

	/**
	 * Get paginated disputed trades
	 *
	 * @param Request $request
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function table(Request $request)
	{
		$trades = MarketplaceTrade::latest()
			->where('status', 'dispute')
			->has('buyer')->has('seller')
			->with(['buyer', 'seller']);

		$trades = paginateResult(
			$trades,
			$request->get('itemPerPage'),
			$request->get('page')
		);

		return MarketplaceTradeResource::collection($trades);
	}
}
