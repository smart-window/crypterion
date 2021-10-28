<?php

namespace App\Http\Controllers\Auth;

use App\Events\UserRegistered;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\Auth\UserRegistered as UserRegisteredNotification;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PragmaRX\Google2FA\Google2FA;

class RegisterController extends Controller
{
	/*
	|--------------------------------------------------------------------------
	| Register Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles the registration of new users as well as their
	| validation and creation. By default this controller uses a trait to
	| provide this functionality without requiring any additional code.
	|
	*/

	use RegistersUsers;

	/**
	 * Where to redirect users after registration.
	 *
	 * @var string
	 */
	protected $redirectTo = '/home';

	/**
	 * Create a new controller instance.
	 *
	 * @param Google2FA $google2fa
	 */
	public function __construct()
	{
		$this->middleware('guest');
	}

	/**
	 * Get a validator for an incoming registration request.
	 *
	 * @param array $data
	 * @return \Illuminate\Contracts\Validation\Validator
	 */
	protected function validator(array $data)
	{
		return Validator::make($data, [
			'email'     => 'required|string|email:rfc,dns,spoof|max:190|unique:users',
			'name'      => 'required|regex:/^[A-z0-9_\-.]{3,16}$/|unique:users',
			'password'  => 'required|string|min:8|confirmed',
			'recaptcha' => getRecaptchaRules()
		]);
	}

	/**
	 * Create a new user instance after a valid registration.
	 *
	 * @param array $data
	 * @return \App\Models\User
	 * @throws \Throwable
	 */
	protected function create(array $data)
	{
		return DB::transaction(function () use ($data) {
			return User::create([
				'name'     => $data['name'],
				'password' => Hash::make($data['password']),
				'email'    => $data['email'],
			]);
		});
	}

	/**
	 * The user has been registered.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @param \App\Models\User $user
	 * @return mixed
	 * @throws \Throwable
	 */
	protected function registered(Request $request, $user)
	{
		$request->session()->regenerate();

		$user->notify(new UserRegisteredNotification());

		event(new UserRegistered($user, $request));

		return response()->json($user->toArray());
	}
}
