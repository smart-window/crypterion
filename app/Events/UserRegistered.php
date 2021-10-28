<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Queue\SerializesModels;

class UserRegistered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

	/**
	 * The authenticated user.
	 *
	 * @var User
	 */
	public $user;

	/**
	 * The request ip.
	 *
	 * @var User
	 */
	public $ip;

	/**
	 * The request user agent.
	 *
	 * @var User
	 */
	public $agent;


	/**
	 * Create a new event instance.
	 *
	 * @param $user
	 * @param Request $request
	 */
	public function __construct($user, $request)
	{
		$this->user = $user;
		$this->agent = $request->header('user-agent');
		$this->ip = $request->ip();
	}
}
