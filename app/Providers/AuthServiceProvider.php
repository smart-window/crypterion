<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
	/**
	 * The policy mappings for the application.
	 *
	 * @var array
	 */
	protected $policies = [
		// 'App\Model' => 'App\Policies\ModelPolicy',
	];

	/**
	 * Register any authentication / authorization services.
	 *
	 * @return void
	 */
	public function boot()
	{
		$this->registerPolicies();
		$this->enableImplicitPermissionGrant();
		$this->passportRoutes();
	}

	/**
	 * Register passport routes
	 */
	protected function passportRoutes()
	{
		Passport::routes();

        Passport::personalAccessClientId(
            config('passport.personal_access_client.id')
        );
	}

	/**
	 * Enable implicit permission grant for "Super Admin" role
	 */
	protected function enableImplicitPermissionGrant()
	{
		Gate::before(function (User $user) {
			$role = config('permission.super_admin_role');
			return $user->hasRole($role) ?: null;
		});
	}
}
