<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Http\Resources\MarketplaceOffer as MarketplaceOfferResource;
use App\Http\Resources\MarketplaceTrade as MarketplaceTradeResource;
use App\Models\MarketplaceOffer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OfferController extends Controller
{
	/**
	 * Start trade with user
	 *
	 * @param Request $request
	 * @param MarketplaceOffer $offer
	 * @return MarketplaceTradeResource
	 * @throws \Illuminate\Validation\ValidationException
	 * @throws \Exception
	 */
	public function startTrade(Request $request, MarketplaceOffer $offer)
	{
		$this->validate($request, [
			'amount' => "required|numeric|min:{$offer->min_amount}|max:{$offer->real_max_amount}"
		]);

		$trade = $offer->startTradeWith(Auth::user(), $request->get('amount'));

		return new MarketplaceTradeResource($trade);
	}

	/**
	 * Get marketplace offer
	 *
	 * @param MarketplaceOffer $offer
	 * @return MarketplaceOfferResource
	 */
	public function get(MarketplaceOffer $offer)
	{
		return new MarketplaceOfferResource($offer);
	}
}
