<?php
/**
 * ======================================================================================================
 * File Name: CoinManager.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 7/13/2019 (11:53 AM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Helpers;


use App\Adapters\Coin\CoinAdapter;
use App\Models\Coin;
use App\Models\Wallet;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class CoinManager
{
	/**
	 * Base coin adapter
	 *
	 * @var string
	 */
	public static $baseAdapter = CoinAdapter::class;

	/**
	 * @var Coin
	 */
	public $coin;

	/**
	 * CoinManager constructor.
	 * @param Coin $coin
	 */
	public function __construct(Coin $coin)
	{
		$this->coin = $coin;
	}

	/**
	 * Get coin price
	 *
	 * @param string $identifier
	 * @param $currency
	 * @return mixed
	 */
	public static function getPrice(string $identifier, $currency)
	{
		$identifier = strtoupper($identifier);
		$currency = strtoupper($currency);
		$key = "coin.{$identifier}.{$currency}.price";
		$expiresAt = now()->addMinute();

		return Cache::remember($key, $expiresAt, function () use ($identifier, $currency) {
			$client = new Client();

			$response = $client->get("https://min-api.cryptocompare.com/data/price", [
				'query' => array_filter([
					'fsym'    => $identifier,
					'tsyms'   => $currency,
					'api_key' => config('cryptocompare.key'),
				])
			]);

			return collect(json_decode($response->getBody(), true))
				->get($currency);
		});
	}

	/**
	 * Get dollar price for identifier
	 *
	 * @param $identifier
	 * @return mixed
	 */
	public static function getDollarPrice(string $identifier)
	{
		return collect(static::getDollarPrices())->get(strtoupper($identifier));
	}

	/**
	 * Batch all dollar prices requests
	 *
	 * @return array
	 */
	public static function getDollarPrices()
	{
		$seconds = config('cryptocompare.cache_period');
		$expiresAt = (app()->environment() === 'local') ?
			now()->addSeconds($seconds * 60 * 12) :
			now()->addSeconds($seconds);

		return Cache::remember('coin.dollarPrices', $expiresAt, function () {
			$prices = [];

			collect(config('cryptocompare.dollar_price.symbols'))
				->map(function ($identifier) {
					return strtoupper($identifier);
				})
				->unique()->chunk(10)
				->each(function (Collection $chunk) use (&$prices) {
					$client = new Client();
					$response = $client->get("https://min-api.cryptocompare.com/data/pricemulti", [
						'query' => [
							'fsyms'   => $chunk->implode(','),
							'tsyms'   => 'USD',
							'api_key' => config('cryptocompare.key'),
						]
					]);

					$body = json_decode($response->getBody(), true);
					$data = collect($body)->map(function ($values) {
						return $values['USD'];
					})->toArray();
					$prices = array_merge($prices, $data);
				});

			return $prices;
		});
	}

	/**
	 * Get currency minute historical data
	 *
	 * @param string $identifier
	 * @param $currency
	 * @param $aggregate
	 * @return mixed
	 */
	public static function getMinuteHistoricalData(string $identifier, $currency, $aggregate = 1)
	{
		$identifier = strtoupper($identifier);
		$currency = strtoupper($currency);
		$key = "coin.{$identifier}.{$currency}.minuteHistoricalData.aggregate.{$aggregate}";
		$expiresAt = now()->addMinute();

		return Cache::remember($key, $expiresAt, function () use ($identifier, $currency, $aggregate) {
			$client = new Client();
			$response = $client->get("https://min-api.cryptocompare.com/data/v2/histominute", [
				'query' => [
					'fsym'      => $identifier,
					'tsym'      => $currency,
					'aggregate' => $aggregate,
					'limit'     => config('cryptocompare.history.limit', 100),
					'api_key'   => config('cryptocompare.key'),
				]
			]);
			return collect(json_decode($response->getBody(), true))->get('Data');
		});
	}

	/**
	 * Get currency hourly historical data
	 *
	 * @param string $identifier
	 * @param $currency
	 * @param $aggregate
	 * @return mixed
	 */
	public static function getHourlyHistoricalData(string $identifier, $currency, $aggregate = 1)
	{
		$identifier = strtoupper($identifier);
		$currency = strtoupper($currency);
		$key = "coin.{$identifier}.{$currency}.hourlyHistoricalData.aggregate.{$aggregate}";
		$expiresAt = now()->addHour();

		return Cache::remember($key, $expiresAt, function () use ($identifier, $currency, $aggregate) {
			$client = new Client();
			$response = $client->get("https://min-api.cryptocompare.com/data/v2/histohour", [
				'query' => [
					'fsym'      => $identifier,
					'tsym'      => $currency,
					'aggregate' => $aggregate,
					'limit'     => config('cryptocompare.history.limit', 100),
					'api_key'   => config('cryptocompare.key'),
				]
			]);
			return collect(json_decode($response->getBody(), true))->get('Data');
		});
	}

	/**
	 * Get currency daily historical data
	 *
	 * @param string $identifier
	 * @param $currency
	 * @param $aggregate
	 * @return mixed
	 */
	public static function getDailyHistoricalData(string $identifier, $currency, $aggregate = 1)
	{
		$identifier = strtoupper($identifier);
		$currency = strtoupper($currency);
		$key = "coin.{$identifier}.{$currency}.dailyHistoricalData.aggregate.{$aggregate}";
		$expiresAt = now()->addDay();

		return Cache::remember($key, $expiresAt, function () use ($identifier, $currency, $aggregate) {
			$client = new Client();
			$response = $client->get("https://min-api.cryptocompare.com/data/v2/histoday", [
				'query' => [
					'fsym'      => $identifier,
					'tsym'      => $currency,
					'aggregate' => $aggregate,
					'limit'     => config('cryptocompare.history.limit', 100),
					'api_key'   => config('cryptocompare.key'),
				]
			]);
			return collect(json_decode($response->getBody(), true))->get('Data');
		});
	}

	/**
	 * Generate passphrase
	 *
	 * @param int $length
	 * @return string
	 */
	public function generateWalletPassphrase($length = 100)
	{
		return str_random($length);
	}

	/**
	 * Get wallet  label
	 *
	 * @return mixed|string
	 */
	public function walletLabel()
	{
		return config('app.name');
	}

	/**
	 * @param CoinAdapter|string $adapter
	 *
	 * @return CoinManager
	 * @throws Exception
	 */
	public static function registerCoin($adapter)
	{
		if (!is_object($adapter) && !is_string($adapter)) {
			throw new Exception(trans('coin.invalid_adapter'));
		}
		if (!is_subclass_of($adapter, static::$baseAdapter)) {
			throw new Exception(trans('coin.invalid_adapter'));
		}
		if (Coin::where('identifier', $adapter->getIdentifier())->exists()) {
			throw new Exception(trans('coin.identifier_exists'));
		}

		$instance = (!is_object($adapter)) ? new $adapter : $adapter;

		return new self(static::create($instance));
	}

	/**
	 * @param CoinAdapter $adapter
	 * @return Coin
	 */
	private static function create($adapter)
	{
		return Coin::create([
			'name'         => $adapter->getName(),
			'identifier'   => $adapter->getIdentifier(),
			'base_unit'    => $adapter->getBaseUnit(),
			'precision'    => $adapter->getPrecision(),
			'symbol'       => $adapter->getSymbol(),
			'symbol_first' => $adapter->showSymbolFirst(),
			'color'        => $adapter->getColor(),
			'adapter'      => $adapter,
		]);
	}

	/**
	 * @param $label
	 * @param $passphrase
	 * @param int $minConfirmations
	 * @return Wallet|\Illuminate\Database\Eloquent\Model
	 * @throws Exception
	 */
	public function createWallet($minConfirmations = 3, $label = null, $passphrase = null)
	{
		$label = $label ?: $this->walletLabel();
		$passphrase = $passphrase ?: $this->generateWalletPassphrase();
		$data = $this->coin
			->adapter->createWallet($label, $passphrase);

		$wallet = $this->coin
			->wallet()->create([
				'source_id'         => $data->getId(),
				'pending'           => $data->isPending(),
				'passphrase'        => $passphrase,
				'label'             => $label,
				'min_confirmations' => $minConfirmations,
				'data'              => $data->getData(),
			]);

		$this->coin->adapter
			->setTransactionWebhook($data, $minConfirmations);
		return $wallet;
	}
}
