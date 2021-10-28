<?php
/**
 * ======================================================================================================
 * File Name: CoinFormatter.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 7/14/2019 (3:47 AM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Helpers;

use App\Models\Coin;

class CoinFormatter
{
	/**
	 * @var Coin
	 */
	protected $coin;

	/**
	 * @var int|float
	 */
	protected $amount;

	/**
	 * @var
	 */
	protected $value;

	/**
	 * Coin constructor.
	 *
	 * @param $amount
	 * @param Coin $coin
	 * @param bool $convert
	 */
	public function __construct($amount, Coin $coin, $convert = false)
	{
		$this->coin = $coin;
		$this->amount = $this->parseAmount($amount, $convert);
	}

	/**
	 * parseAmount.
	 *
	 * @param mixed $amount
	 * @param bool $convert
	 *
	 * @return int|float
	 * @throws \UnexpectedValueException
	 *
	 */
	protected function parseAmount($amount, $convert = false)
	{
		$amount = $this->parseAmountFromString($amount);

		return (float) round(
			$this->convertAmount($amount, $convert), $this->coin->getPrecision()
		);
	}

	/**
	 * parseAmountFromString.
	 *
	 * @param mixed $amount
	 *
	 * @return int|float|mixed
	 */
	protected function parseAmountFromString($amount)
	{
		if (!is_string($amount)) {
			return $amount;
		}

		return (float) $amount;
	}

	/**
	 * convertAmount.
	 *
	 * @param int|float $amount
	 * @param bool $convert
	 *
	 * @return int|float
	 */
	protected function convertAmount($amount, $convert = false)
	{
		if (!$convert) return $amount;

		return (float) $amount * $this->coin->getBaseUnit();
	}

	/**
	 * getAmount.
	 *
	 * @return int|float
	 */
	public function getAmount()
	{
		return $this->amount;
	}

	/**
	 * getValue.
	 *
	 * @return float
	 */
	public function getValue()
	{
		if (!isset($this->value)) {
			$this->value = round($this->amount / $this->coin->getBaseUnit(), $this->coin->getPrecision());
		}

		return $this->value;
	}

	/**
	 * @return string
	 */
	public function getFormattedValue()
	{
		return $this->coin->getPrefix() . $this->getValue() . $this->coin->getSuffix();
	}

	/**
	 * @param null $dollarPrice
	 * @return float
	 */
	public function calcPrice($dollarPrice = null)
	{
		if (is_null($dollarPrice)) {
			$dollarPrice = $this->coin->getDollarPrice();
		}

		return $this->getValue() * $dollarPrice;
	}

	/**
	 * @param string $currency
	 * @param null $dollarPrice
	 * @param bool $format
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
	public function getPrice($currency = 'USD', $dollarPrice = null, $format = false)
	{
		$price = $this->calcPrice($dollarPrice);
		$currency = strtoupper($currency);

		if ($currency != 'USD') {
			return currency($price, 'USD', $currency, $format);
		}

		return ($format) ?
			currency_format($price, $currency) : $price;
	}


	/**
	 * @param string $currency
	 * @param null $dollarPrice
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
	public function getFormattedPrice($currency = 'USD', $dollarPrice = null)
	{
		$price = $this->calcPrice($dollarPrice);
		$currency = strtoupper($currency);

		if ($currency != 'USD') {
			return currency($price, 'USD', $currency, true);
		}

		return currency_format($price, $currency);
	}

	/**
	 * Convert to String.
	 *
	 * @return string
	 */
	public function __toString()
	{
		return (string) $this->getValue();
	}
}