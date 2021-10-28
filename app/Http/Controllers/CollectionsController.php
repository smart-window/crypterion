<?php

namespace App\Http\Controllers;

use App\Models\Coin;
use App\Models\MarketplaceTag;
use App\Models\PaymentMethod;
use App\Models\Wallet;

class CollectionsController extends Controller
{
	/**
	 * Get supported currencies.
	 *
	 * @return array
	 */
	public function currencies()
    {
    	return currency()->getCurrencies();
    }

	/**
	 * @return PaymentMethod[]
	 */
	public function paymentMethods()
	{
		return PaymentMethod::with('walletFees')->get();
	}

	/**
	 * Get array of coins
	 *
	 * @return Coin[]|\Illuminate\Database\Eloquent\Collection
	 */
	public function coins()
	{
		return Coin::all();
	}

	/**
	 * Get array of wallets
	 *
	 * @return Coin[]|\Illuminate\Database\Eloquent\Collection
	 */
	public function wallets()
	{
		return Wallet::all();
	}

	/**
	 * Get array of countries
	 *
	 * @return array
	 */
	public function countries()
	{
		return config()->get('countries');
	}

	/**
	 * @return MarketplaceTag[]|\Illuminate\Database\Eloquent\Collection
	 */
	public function marketplaceTags()
	{
		return MarketplaceTag::all();
	}
}
