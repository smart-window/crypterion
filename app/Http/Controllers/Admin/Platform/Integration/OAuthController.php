<?php

namespace App\Http\Controllers\Admin\Platform\Integration;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Laravel\Passport\Client;
use Laravel\Passport\ClientRepository;
use Laravel\Passport\Passport;

class OAuthController extends Controller
{
	/**
	 * @var ClientRepository
	 */
	protected $clients;

	/**
	 * DevelopmentController constructor.
	 *
	 * @param ClientRepository $clients
	 */
	public function __construct(ClientRepository $clients)
	{
		$this->clients = $clients;
	}

	/**
	 * Get the active password clients
	 *
	 * @return Builder[]|\Illuminate\Database\Eloquent\Collection
	 */
	public function clientList()
	{
		return $this->client()->latest()
			->where('password_client', true)
			->where('revoked', false)->get()
			->makeVisible('secret');
	}

	/**
	 * Create new client
	 *
	 * @param Request $request
	 * @return Client
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function clientCreate(Request $request)
	{
		$this->validate($request, [
			'name' => 'required|max:190',
		]);

		return $this->clients->createPasswordGrantClient(
			null, $request->get('name'),
			'http://localhost'
		);
	}

	/**
	 * Delete client
	 *
	 * @param Client $client
	 */
	public function clientDelete(Client $client)
	{
		$this->clients->delete($client);
	}

	/**
	 * Get a new client model instance.
	 *
	 * @return Client|Builder
	 */
	protected function client()
	{
		return Passport::client();
	}
}
