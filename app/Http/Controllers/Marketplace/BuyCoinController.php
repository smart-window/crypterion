<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Http\Resources\MarketplaceOffer as MarketplaceOfferResource;
use App\Models\MarketplaceOffer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BuyCoinController extends Controller
{
	/**
	 * @param Request $request
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function table(Request $request)
	{
		$offers = getVisibleMarketplaceOffers()->where('type', 'sell')
			->sortByDesc('successful_trades_count');

		$filters = $request->get('filters', []);

		if (array_has($filters, 'amount') && is_numeric($filters['amount'])) {
			$offers = $offers->filter(function (MarketplaceOffer $offer) use ($filters) {
				return ($offer->min_amount <= $filters['amount'] && $offer->real_max_amount >= $filters['amount']);
			});
		}

		if (array_has($filters, 'label') && is_string($filters['label'])) {
			$offers = $offers->filter(function (MarketplaceOffer $offer) use ($filters) {
				return Str::contains($offer->label, $filters['label']);
			});
		}

		if (array_has($filters, 'coin_identifier') && is_string($filters['coin_identifier'])) {
			$offers = $offers->filter(function (MarketplaceOffer $offer) use ($filters) {
				return strtolower($offer->walletAccount->wallet->coin->identifier) == strtolower($filters['coin_identifier']);
			});
		}

		if (array_has($filters, 'currency') && is_string($filters['currency'])) {
			$offers = $offers->filter(function (MarketplaceOffer $offer) use ($filters) {
				return strtoupper($offer->currency) == strtoupper($filters['currency']);
			});
		}

		if (array_has($filters, 'country') && is_string($filters['country'])) {
			$offers = $offers->filter(function (MarketplaceOffer $offer) use ($filters) {
				return !is_string($offer->country) || strtoupper($offer->country) == strtoupper($filters['country']);
			});
		}

		if (array_has($filters, 'tags') && $filters['tags'] && is_array($filters['tags'])) {
			$offers = $offers->filter(function ($offer) use ($filters) {
				return count(array_intersect($offer->tags, $filters['tags'])) > 0;
			});
		}

		$offers =  paginateCollection(
			$offers,
			$request->get('itemPerPage'),
			$request->get('page'),
			array_only($filters, ['payment_method_id'])
		);

		return MarketplaceOfferResource::collection($offers);
	}
}
