<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionsTableSeeder extends Seeder
{
	/**
	 * List of permissions
	 *
	 * @var array
	 */
	protected $permissions = array(
		'access_control_panel',
		'manage_user_roles',
		'manage_wallets',
		'manage_settings',
		'manage_notification',
		'manage_customization',
		'manage_integration',
		'manage_translation',
		'manage_users',
		'moderate_chats',
		'manage_marketplace'
	);

	/**
	 * List of roles and their levels
	 *
	 * @var array
	 */
	protected $roles = array(
		[
			'name'        => 'super_admin',
			'level'       => 100,
			'permissions' => [],
		],
		[
			'name'        => 'admin',
			'level'       => 95,
			'permissions' => [
				'access_control_panel',
				'manage_settings',
				'manage_notification',
				'manage_customization',
				'manage_integration',
				'manage_translation',
				'manage_users',
				'moderate_chats',
				'manage_marketplace',
			],
		],
		[
			'name'        => 'moderator',
			'level'       => 91,
			'permissions' => [
				'moderate_chats',
				'manage_marketplace',
				'manage_users',
			],
		],
	);

	/**
	 * Seed Permissions Table
	 */
	private function seedPermissions()
	{
		collect($this->permissions)->each(function ($name) {
			Permission::updateOrCreate(['name' => $name]);
		});
	}

	/**
	 * Seed roles table
	 */
	private function seedRoles()
	{
		collect($this->roles)->each(function ($value) {
			$permissions = $value['permissions'];

			$attributes = collect($value)
				->only(['name', 'level']);

			$role = Role::updateOrCreate([
				'name' => $attributes->get('name')
			], $attributes->toArray());

			$role->syncPermissions($permissions);
		});
	}

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		$this->seedPermissions();
		$this->seedRoles();
	}
}
