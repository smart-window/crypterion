<?php

namespace HolluwaTosin360\Currency\Console;

use DateTime;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class Update extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'currency:update';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Update exchange rates from an online source';

	/**
	 * Currency instance
	 *
	 * @var \HolluwaTosin360\Currency\Currency
	 */
	protected $currency;

	/**
	 * Create a new command instance.
	 */
	public function __construct()
	{
		$this->currency = app('currency');

		parent::__construct();
	}

	/**
	 * Execute the console command for Laravel 5.4 and below
	 *
	 * @return void
	 * @throws \Exception
	 */
	public function fire()
	{
		$this->handle();
	}

	/**
	 * Execute the console command.
	 *
	 * @return void
	 * @throws \Exception
	 */
	public function handle()
	{
		// Get Settings
		// $currency = $this->currency->config('default');

		if (!$key = $this->currency->config('api_key')) {
			$this->error('An API key is needed from OpenExchangeRates.org to continue.');

			return;
		}

		// Get rates from OpenExchangeRates
		$this->updateFromOpenExchangeRates($key);
	}

	/**
	 * Fetch rates from the API
	 *
	 * @param $key
	 * @throws \Exception
	 */
	private function updateFromOpenExchangeRates($key)
	{
		$this->info('Updating exchange rates from OpenExchangeRates.org...');

		// Make request
		$content = json_decode($this->request("http://openexchangerates.org/api/latest.json?base=USD&app_id={$key}&show_alternative=1"));

		// Error getting content?
		if (isset($content->error)) {
			$this->error($content->description);

			return;
		}

		// Parse timestamp for DB
		$timestamp = (new DateTime())->setTimestamp($content->timestamp);

		// Update each rate
		foreach ($content->rates as $code => $value) {
			$this->currency->getDriver()->update($code, [
				'exchange_rate' => $value,
				'updated_at'    => $timestamp,
			]);
		}

		$this->currency->clearCache();
		$this->info('Update complete!');
	}

	/**
	 * Make the request to the sever.
	 *
	 * @param $url
	 *
	 * @return string
	 */
	private function request($url)
	{
		$ch = curl_init($url);

		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 20);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.1) Gecko/20061204 Firefox/2.0.0.1");
		curl_setopt($ch, CURLOPT_HTTPGET, true);
		curl_setopt($ch, CURLOPT_MAXREDIRS, 2);
		curl_setopt($ch, CURLOPT_MAXCONNECTS, 2);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

		$response = curl_exec($ch);
		curl_close($ch);

		return $response;
	}
}
