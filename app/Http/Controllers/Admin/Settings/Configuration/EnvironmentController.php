<?php

namespace App\Http\Controllers\Admin\Settings\Configuration;

use App\Http\Controllers\Controller;
use Exception;
use GuzzleHttp\Client;
use HolluwaTosin360\BitGoPHP\BitGo;
use Illuminate\Container\Container;
use Illuminate\Http\Request;
use Illuminate\Redis\RedisManager;
use Jackiedo\DotenvEditor\DotenvEditor;

class EnvironmentController extends Controller
{
	/**
	 * @var DotenvEditor
	 */
	protected $editor;

	/**
	 * GeneralController constructor.
	 *
	 * @param DotenvEditor $editor
	 * @throws Exception
	 */
	public function __construct(DotenvEditor $editor)
	{
		$this->editor = $editor;
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
		if (config('app.live_preview')) {
			return abort(403, 'Not Available');
		}
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
			'APP_NAME'                 => [
				'rules' => 'required|string|max:100',
			],
			'APP_URL'                  => [
				'rules' => 'required|url',
			],

			#Redis
			'REDIS_HOST'               => [
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
			'REDIS_PASSWORD'           => [
				'rules' => 'required|string',
			],
			'REDIS_PORT'               => [
				'rules' => 'required|numeric',
			],

			#Broadcast
			'BROADCAST_DRIVER'         => [
				'rules' => 'required|in:pusher,redis',
			],

			#Pusher
			'PUSHER_APP_ID'            => [
				'rules' => 'nullable|required_if:BROADCAST_DRIVER,pusher|string',
			],
			'PUSHER_APP_KEY'           => [
				'rules' => 'nullable|required_if:BROADCAST_DRIVER,pusher|string',
			],
			'PUSHER_APP_SECRET'        => [
				'rules' => 'nullable|required_if:BROADCAST_DRIVER,pusher|string',
			],
			'PUSHER_APP_CLUSTER'       => [
				'rules' => 'nullable|required_if:BROADCAST_DRIVER,pusher|string',
			],

			#Mail
			'MAIL_DRIVER'              => [
				'rules' => 'required|in:smtp,sendmail',
			],
			'MAIL_FROM_NAME'           => [
				'rules' => 'required|string',
			],
			'MAIL_FROM_ADDRESS'        => [
				'rules' => 'required|email',
			],
			'MAIL_HOST'                => [
				'rules' => 'nullable|required_if:MAIL_DRIVER,smtp|string',
			],
			'MAIL_PORT'                => [
				'rules' => 'nullable|required_if:MAIL_DRIVER,smtp|numeric',
			],
			'MAIL_USERNAME'            => [
				'rules' => 'nullable|required_if:MAIL_DRIVER,smtp|string',
			],
			'MAIL_PASSWORD'            => [
				'rules' => 'nullable|required_if:MAIL_DRIVER,smtp|string',
			],
			'MAIL_ENCRYPTION'          => [
				'rules' => 'nullable|required_if:MAIL_DRIVER,smtp|string',
			],

			#SMS
			'SMS_PROVIDER'             => [
				'rules' => 'required|in:twilio,africastalking,nexmo',
			],

			#Nexmo
			'NEXMO_KEY'                => [
				'rules' => 'nullable|required_if:SMS_PROVIDER,nexmo|string',
			],
			'NEXMO_SECRET'             => [
				'rules' => 'nullable|required_if:SMS_PROVIDER,nexmo|string',
			],
			'NEXMO_PHONE'              => [
				'rules' => 'nullable|required_if:SMS_PROVIDER,nexmo|string',
			],

			#AfricasTalking
			'AFRICASTALKING_USERNAME'  => [
				'rules' => 'nullable|required_if:SMS_PROVIDER,africastalking|string',
			],
			'AFRICASTALKING_KEY'       => [
				'rules' => 'nullable|required_if:SMS_PROVIDER,africastalking|string',
			],
			'AFRICASTALKING_FROM'      => [
				'rules' => 'nullable|string',
			],
			'AFRICASTALKING_ENQUEUE'   => [
				'rules' => 'nullable|boolean',
				'parse' => function ($value) {
					return $value ? 'true' : 'false';
				}
			],

			#Twilio
			'TWILIO_TOKEN'             => [
				'rules' => 'nullable|required_if:SMS_PROVIDER,twilio|string',
			],
			'TWILIO_ID'                => [
				'rules' => 'nullable|required_if:SMS_PROVIDER,twilio|string',
			],
			'TWILIO_NUMBER'            => [
				'rules' => 'nullable|required_if:SMS_PROVIDER,twilio|string',
			],

			#Google
			'GOOGLE_RECAPTCHA_ENABLE'  => [
				'rules' => 'nullable|boolean',
				'parse' => function ($value) {
					return $value ? 'true' : 'false';
				}
			],
			'GOOGLE_RECAPTCHA_SECRET'  => [
				'rules' => 'required|string',
			],
			'GOOGLE_RECAPTCHA_SITEKEY' => [
				'rules' => 'required|string',
			],
			'GOOGLE_RECAPTCHA_TYPE'    => [
				'rules' => 'required|in:normal,invisible,compact',
			],

			#Bitgo
			'BITGO_ENV'                => [
				'rules' => 'required|in:test,prod',
			],
			'BITGO_TOKEN'              => [
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
			'BITGO_HOST'               => [
				'rules' => 'required|url',
			],
			'BITGO_PORT'               => [
				'rules' => 'required|numeric',
			],

			#Cryptocompare
			'CRYPTOCOMPARE_KEY'        => [
				'rules' => 'required|string',
			],

			#OER
			'OER_KEY'                  => [
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
}
