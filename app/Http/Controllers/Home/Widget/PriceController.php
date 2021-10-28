<?php

namespace App\Http\Controllers\Home\Widget;

use App\Helpers\CoinManager;
use App\Http\Controllers\Controller;

class PriceController extends Controller
{
	/**
	 * Get bitcoin price data
	 *
	 * @param $identifier
	 * @return array
	 */
	public function data($identifier)
	{
		$currency = currency()->getUserCurrency();
		$identifier = strtoupper($identifier);
		$history = $this->getDailyHistoricalData($identifier, $currency);
		$price = $this->getPrice($identifier, $currency);

		return [
			'currency'        => $currency,
			'formatted_price' => currency_format($price, $currency),
			'price'           => $price,
			'history'         => $history,
		];
	}

	/**
	 * Get historical data for alternate currency
	 *
	 * @param $identifier
	 * @param $currency
	 * @return \Illuminate\Support\Collection
	 */
	public function getDailyHistoricalData($identifier, $currency)
	{
		return CoinManager::getDailyHistoricalData($identifier, $currency);
	}

	/**
	 * Get dollar price in currency
	 *
	 * @param $identifier
	 * @param $currency
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
	public function getPrice($identifier, $currency)
	{
		return $this->getPriceFromDollar($identifier, $currency) ?:
			CoinManager::getPrice($identifier, $currency);
	}

	/**
	 * Get price from dollar
	 *
	 * @param $identifier
	 * @param $currency
	 * @return \HolluwaTosin360\Currency\Currency|mixed|string
	 */
	public function getPriceFromDollar($identifier, $currency)
	{
		$dollarPrice = CoinManager::getDollarPrice($identifier);
		return $dollarPrice ? currency($dollarPrice, 'USD', $currency) :
			$dollarPrice;
	}
}
