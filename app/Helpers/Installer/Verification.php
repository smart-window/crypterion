<?php
/**
 * ======================================================================================================
 * File Name: InstallationHelper.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 11/16/2019 (10:37 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Helpers\Installer;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Cache\Repository as Cache;
use Illuminate\Support\Facades\URL;
use Psr\Http\Message\ResponseInterface;

class Verification
{
	/**
	 * Guzzle client instance
	 *
	 * @var Client
	 */
	protected $client;

	/**
	 * Validation server's API End point
	 *
	 * @var \Illuminate\Config\Repository|mixed
	 */
	protected $endpoint;

	/**
	 * The key used to store verification code in
	 * the cache system
	 *
	 * @var string
	 */
	public $prefix = 'verification.';

	/**
	 * @var Cache
	 */
	protected $cache;

	/**
	 * Installer constructor.
	 * @param Cache $cache
	 */
	public function __construct(Cache $cache)
	{
		$this->client = new Client([
			'headers' => [
				'Accept' => 'application/x.oluwatosin.v2+json'
			]
		]);

		$this->cache = $cache;
	}

	/**
	 * @return array
	 */
	public function purchaseDetails()
	{
		return $this->details($this->getVerificationCode());
	}

	/**
	 * Create installation log
	 */
	public static function createLog()
	{
		$file = storage_path('installed');

		if (!file_exists($file)) {
			$contents[] = [
				'status' => 'Installed',
				'date' => date("Y/m/d h:i:s")
			];
		} else {
			$contents = json_decode(
				file_get_contents($file), true
			);

			$contents[] = [
				'status' => 'Updated',
				'date' => date("Y/m/d h:i:s")
			];
		}

		file_put_contents(
			$file, json_encode($contents)
		);
	}

	/**
	 * Check the details of a licenses
	 *
	 * @param $code
	 * @return array|
	 */
	public function details($code)
	{
		$endpoint = config('installer.endpoint');

		if (!$this->cache->has($this->prefix . 'details')) {
			try {
				$response = $this->client->get($endpoint, $this->params($code));

				$statusCode = $response->getStatusCode();

				if ($statusCode == 200) {
					$details = (string) $response->getBody();

					$this->cache->put($this->prefix . 'details', $details, now()->addDay());

				} else {
					return $this->errorMessage($response);
				}
			} catch (ClientException $e) {
				return $this->errorMessage($e->getResponse());
			}
		} else {
			$details = $this->cache->get($this->prefix . 'details');

		}
	}

	/**
	 * @param $code
	 * @return array
	 */
	public function check($code)
	{
		try {
			$endpoint = config('installer.endpoint');

			$response = $this->client->get($endpoint, $this->params($code));
		} catch (ClientException $e) {
			return $this->errorMessage($e->getResponse());
		}
	}

	/**
	 * Clear purchase details
	 */
	public function clearDetails()
	{
		$this->cache->forget($this->prefix . 'details');
	}

	/**
	 * Prepare the options for api requests
	 *
	 * @param $code
	 * @return array
	 */
	public function params($code)
	{
		return [
			'query' => [
				'url'  => URL::to('/'),
				'code' => $code,
			]
		];
	}

	/**
	 * Prepare error message
	 *
	 * @param ResponseInterface $response
	 * @return array
	 */
	public function errorMessage($response)
	{
		$status_code = $response->getStatusCode();

		if ($status_code == 400) {
			return ['error'   => $status_code,
			        'message' => __('An unexpected error occurred! Please contact the author of this script')
			];
		} elseif ($status_code == 401) {
			return ['error'   => $status_code,
			        'message' => __('Your verification code seems to be invalid. Please try again!')
			];
		} elseif ($status_code == 404) {
			return ['error'   => $status_code,
			        'message' => __('An unexpected error occurred! Your license details could not be found!')
			];
		} elseif ($status_code == 403) {
			return ['error'   => $status_code,
			        'message' => __('Your license verification code is already registered with another domain.')
			];
		}

		return ['error' => $status_code, 'message' => __('Opps! Something went wrong!')];
	}

	/**
	 * Get verification code
	 *
	 * @return mixed
	 */
	public function getVerificationCode()
	{
		return $this->cache->get($this->prefix . 'code');
	}

	/**
	 * @param $code
	 */
	public function setVerificationCode($code)
	{
		$this->cache->forever($this->prefix . 'code', $code);
	}
}