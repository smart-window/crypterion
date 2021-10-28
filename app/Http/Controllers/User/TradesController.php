<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\MarketplaceTrade as MarketplaceTradeResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TradesController extends Controller
{
	/**
	 * Get paginated trades
	 *
	 * @param Request $request
	 * @param $name
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function table(Request $request, $name)
	{
		$trades = $this->findUserByName($name)
			->availableMarketplaceTrades()->with(['buyer', 'seller'])
			->latest();

		$trades = paginateResult(
			$trades,
			$request->get('itemPerPage'),
			$request->get('page')
		);

		return MarketplaceTradeResource::collection($trades);
	}

	/**
	 * @param $name
	 * @return \App\Models\User|void
	 */
	private function findUserByName($name)
	{
		$user = User::where('name', $name)
			->firstOrFail();

		if (!(Auth::user()->is($user) || Auth::user()->can('manage_marketplace'))) {
			abort(403, trans('auth.access_forbidden'));
		} else {
			return $user;
		}
	}
}
