<?php

namespace App\Http\Controllers\Installer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\License;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Jackiedo\DotenvEditor\DotenvEditor;
use JSsVPSDioNXpfRC;

class AdministratorController extends Controller
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
	 * IndexController constructor.
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
	 * Get a validator for an incoming registration request.
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateUser(Request $request)
	{
		return $this->validate($request, [
			'email'    => 'required|string|email|max:190|unique:users',
			'name'     => 'required|regex:/^[A-z0-9_\-.]{3,16}$/|unique:users',
			'password' => 'required|string|min:8|confirmed',
		]);
	}

	/**
	 * Create a new user instance after a valid registration.
	 *
	 * @param Request $request
	 * @return \App\Models\User
	 * @throws \Throwable
	 */
	protected function createUser(Request $request)
	{
		return DB::transaction(function () use ($request) {
			$user = User::create([
				'name'     => $request->get('name'),
				'password' => Hash::make($request->get('password')),
				'email'    => $request->get('email'),
			]);
			$role = config('permission.super_admin_role');
			$user->assignRole($role);
			return $user;
		});
	}

	/**
	 * Register administrator
	 *
	 * @param Request $request
	 * @throws \Throwable
	 */
	public function register(Request $request)
	{
		try {
			$this->migrateAndSeed();
			$this->registerLicense($request);
			$this->validateUser($request);

			$this->saveLicenseDetails($request);

			$this->restartQueue();
			$this->createPassportKeys();
			$this->symlinkPublicStorage();
			$this->addCurrencies();
			$this->createUser($request);
			$this->disableAppDebug();
		} catch (Exception $exception) {
			$this->removeLicenseDetails();
			throw $exception;
		}
	}

	/**
	 * Run database migration
	 *
	 * @return void
	 */
	protected function migrateAndSeed()
	{
		Artisan::call('migrate --force');
		Artisan::call('db:seed --force');
	}

	/**
	 * Restart queue
	 *
	 * @return void
	 */
	protected function restartQueue()
	{
		Artisan::call('queue:restart');
	}

	/**
	 * Restart queue
	 *
	 * @return void
	 */
	protected function addCurrencies()
	{
		try {
			Artisan::call('currency:manage add all');
		} catch (Exception $e) {
			return report($e);
		}
	}

	/**
	 * Create passport keys
	 *
	 * @return void
	 */
	protected function createPassportKeys()
	{
		Artisan::call('passport:install --force');
	}

	/**
	 * Create symlink for public storage
	 *
	 * @return void
	 */
	protected function symlinkPublicStorage()
	{
		try {
			Artisan::call('storage:link');
		} catch (Exception $e) {
			return report($e);
		}
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

	/**
	 * Set license details
	 *
	 * @param Request $request
	 */
	protected function saveLicenseDetails($request)
	{
		$details = $this->licenseDetails($request);
		$this->crypterion->saveLicenseDetails(
			$details->get('code'),
			$details->get('email')
		);
	}

	/**
	 * Remove license details
	 */
	protected function removeLicenseDetails()
	{
		$this->crypterion->removeLicenseDetails();
	}

	/**
	 * Register license
	 *
	 * @param Request $request
	 * @return License
	 */
	protected function registerLicense($request)
	{
		$details = $this->licenseDetails($request);

		return $this->crypterion->registerLicense(
			$details->get('code'),
			$details->get('email')
		);
	}

	/**
	 * Set APP_DEBUG to false
	 */
	protected function disableAppDebug()
	{
		$this->editor->setKey('APP_DEBUG', 'false');
		$this->editor->save();
	}
}
