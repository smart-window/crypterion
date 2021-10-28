<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\MarketplaceOffer as MarketplaceOfferResource;
use App\Models\MarketplaceOffer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OffersController extends Controller
{
	/**
	 * Get paginated offers
	 *
	 * @param Request $request
	 * @param $name
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function table(Request $request, $name)
	{
		$offers = $this->findUserByName($name)->availableMarketplaceOffers()->get()
			->filter(function (MarketplaceOffer $offer) {
				return Auth::user() ? (
					$offer->filterByUser(Auth::user(), true) ||
					Auth::user()->can('manage_marketplace')
				) : $offer->filterByGuest();
			});

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

		$offers = paginateCollection(
			$offers,
			$request->get('itemPerPage'),
			$request->get('page'),
			array_only($filters, ['payment_method_id'])
		);

		return MarketplaceOfferResource::collection($offers);
	}

	/**
	 * @param Request $request
	 * @param $name
	 */
	public function hide(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		$offer = $user->marketplaceOffers()->findOrFail($request->get('id'));

		if (!$offer->canBeManagedBy(Auth::user())) {
			abort(403, trans('auth.access_forbidden'));
		} else {
			$offer->update(['status' => false]);
		}
	}

	/**
	 * @param Request $request
	 * @param $name
	 */
	public function show(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		$offer = $user->marketplaceOffers()->findOrFail($request->get('id'));

		if (!$offer->canBeManagedBy(Auth::user())) {
			abort(403, trans('auth.access_forbidden'));
		} else {
			$offer->update(['status' => true]);
		}
	}

	/**
	 * @param Request $request
	 * @param $name
	 * @throws \Exception
	 */
	public function delete(Request $request, $name)
	{
		$user = $this->findUserByName($name);

		$offer = $user->marketplaceOffers()
			->findOrFail($request->get('id'));

		if (!$offer->canBeManagedBy(Auth::user())) {
			abort(403, trans('auth.access_forbidden'));
		} else {
			$offer->delete();
		}
	}

	/**
	 * @param $name
	 * @return \App\Models\User
	 */
	private function findUserByName($name)
	{
		return User::where('name', $name)->firstOrFail();
	}
}
