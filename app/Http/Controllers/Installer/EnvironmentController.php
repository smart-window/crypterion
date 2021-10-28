<?php

namespace App\Http\Controllers\Installer;

use App\Http\Controllers\Controller;
use App\Providers\License;
use Exception;
use GuzzleHttp\Client;
use HolluwaTosin360\BitGoPHP\BitGo;
use Illuminate\Container\Container;
use Illuminate\Http\Request;
use Illuminate\Redis\RedisManager;
use Illuminate\Support\Collection;
use Jackiedo\DotenvEditor\DotenvEditor;
use JSsVPSDioNXpfRC;

class EnvironmentController extends Controller
{
	/**
	 * @var DotenvEditor
	 */
	protected $editor;

	/**
	 * @var JSsVPSDioNXpfRC
	 */
	protected $crypterion;

	/**
	 * GeneralController constructor.
	 *
	 * @param DotenvEditor $editor
	 * @param JSsVPSDioNXpfRC $crypterion
	 */
	public function __construct(DotenvEditor $editor, $crypterion)
	{
		if (!is_subclass_of($crypterion, 'JSsVPSDioNXpfRC')) {
			return app()->abort(500, 'Corrupted filesystem.');
		}

		$this->editor = $editor;
		$this->crypterion = $crypterion;

		$this->middleware(function ($request, $next) {
			if ($this->verifyLicense($request)) {
				return $next($request);
			} else {
				return abort(403);
			}
		});
	}

	/**
	 * Get environment data
	 *
	 * @param Request $request
	 * @return \Illuminate\Support\Collection
	 */
	public function data(Request $request)
	{
		return collect($this->properties($request))
			->keys()->mapWithKeys(function ($key) {
				$env = env($key);
				$value = is_null($env) ? "null" : $env;
				return [$key => $value];
			});
	}

	/**
	 * Validate properties
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateProperties(Request $request)
	{
		$rules = collect($this->properties($request))
			->map(function ($data) {
				return !isset($data['rules']) ? null : $data['rules'];
			})->filter()->toArray();

		return $this->validate($request, $rules);
	}

	/**
	 * Update environment
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function update(Request $request)
	{
		$this->validateProperties($request);
		$properties = collect($this->properties($request));

		$values = $properties->map(function ($data, $key) use ($request) {
			$value = $request->get($key);

			if (isset($data['parse']) && is_callable($data['parse'])) {
				$value = $data['parse']($value);
			}

			return ['key' => $key, 'value' => $value];
		});

		$this->editor->setKeys($values->toArray());
		$this->editor->setKey('CACHE_DRIVER', 'redis');
		$this->editor->save();
	}


	/**
	 * Environment variable properties
	 *
	 * @param Request $request
	 * @return array
	 */
	private function properties(Request $request)
	{
		return [
			#Application
			'APP_NAME'           => [
				'rules' => 'required|string|max:100',
			],
			'APP_URL'            => [
				'rules' => 'required|url',
			],

			#Redis
			'REDIS_HOST'         => [
				'rules' => [
					'required', 'string',
					function ($attribute, $value, $fail) use ($request) {
						$port = $request->get('REDIS_PORT');
						$password = $request->get('REDIS_PASSWORD');
						$app = Container::getInstance();
						$config = $app->make('config')->get('database.redis');
						$password = $password == "null" ? null : $password;

						$config['cache']['host'] = $value;
						$config['cache']['password'] = $password;
						$config['cache']['port'] = $port;

						$config['default']['host'] = $value;
						$config['default']['password'] = $password;
						$config['default']['port'] = $port;

						$client = array_pull($config, 'client', 'predis');
						$redis = new RedisManager($app, $client, $config);
						try {
							$redis->connection('default')->flushdb();
							$redis->connection('cache')->flushdb();
						} catch (Exception $e) {
							$fail($e->getMessage());
						}
					}
				],
			],
			'REDIS_PASSWORD'     => [
				'rules' => 'required|string',
			],
			'REDIS_PORT'         => [
				'rules' => 'required|numeric',
			],

			#Database
			'DB_CONNECTION'      => [
				'rules' => 'required|in:sqlite,mysql,pgsql,sqlsrv',
			],
			'DB_HOST'            => [
				'rules' => 'nullable|required_unless:DB_CONNECTION,sqlite|string',
			],
			'DB_PORT'            => [
				'rules' => 'nullable|required_unless:DB_CONNECTION,sqlite|string',
			],
			'DB_DATABASE'        => [
				'rules' => 'nullable|required_unless:DB_CONNECTION,sqlite|string',
			],
			'DB_USERNAME'        => [
				'rules' => 'nullable|required_unless:DB_CONNECTION,sqlite|string',
			],
			'DB_PASSWORD'        => [
				'rules' => 'nullable|required_unless:DB_CONNECTION,sqlite|string',
			],

			#Pusher
			'PUSHER_APP_ID'      => [
				'rules' => 'required|string',
			],
			'PUSHER_APP_KEY'     => [
				'rules' => 'required|string',
			],
			'PUSHER_APP_SECRET'  => [
				'rules' => 'required|string',
			],
			'PUSHER_APP_CLUSTER' => [
				'rules' => 'required|string',
			],

			#Bitgo
			'BITGO_ENV'          => [
				'rules' => 'required|in:test,prod',
			],
			'BITGO_TOKEN'        => [
				'rules' => [
					'required', 'string',
					function ($attribute, $value, $fail) use ($request) {
						$host = $request->get('BITGO_HOST');
						$port = $request->get('BITGO_PORT');
						$express = new BitGo($host, $port, $value);
						try {
							$session = $express->getSessionInfo();
							if (!isset($session['session']['unlock'])) {
								return $fail(trans('bitgo.long_lived_token_required'));
							}
						} catch (Exception $e) {
							$fail($e->getMessage());
						}
					}
				],
			],
			'BITGO_HOST'         => [
				'rules' => 'required|url',
			],
			'BITGO_PORT'         => [
				'rules' => 'required|numeric',
			],

			#Cryptocompare
			'CRYPTOCOMPARE_KEY'  => [
				'rules' => 'required|string',
			],

			#OER
			'OER_KEY'            => [
				'rules' => [
					'required', 'string',
					function ($attribute, $value, $fail) {
						try {
							$client = new Client();

							$client->get("https://openexchangerates.org/api/usage.json", [
								'query' => ['app_id' => $value]
							]);
						} catch (Exception $e) {
							$fail(trans('common.invalid_api_key'));
						}
					}
				],
			],
		];
	}

	/**
	 * Get license details from request
	 *
	 * @param Request $request
	 * @return Collection
	 */
	protected function licenseDetails($request)
	{
		return collect($request->get('license'));
	}

	/**
	 * Verify license
	 *
	 * @param Request $request
	 * @return bool
	 */
	protected function verifyLicense($request)
	{
		$details = $this->licenseDetails($request);
		try {
			$license = $this->crypterion->verifyLicense(
				$details->get('code'),
				$details->get('email')
			);

			return $license instanceof License;
		} catch (Exception $e) {
			return false;
		}
	}
}
