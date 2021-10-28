<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class RoleController extends Controller
{
	/**
	 * @var array
	 */
	protected $permissions;

	/**
	 * @var array
	 */
	protected $roles;

	/**
	 * Get roles and permissions
	 *
	 * @return Builder[]|\Illuminate\Database\Eloquent\Collection
	 */
	public function data()
	{
		return [
			'permissions' => $this->getPermissions(),
			'roles'       => $this->getRoles(),
		];
	}

	/**
	 * Get all assignable permissions
	 *
	 * @return Builder[]|\Illuminate\Database\Eloquent\Collection
	 */
	private function getPermissions()
	{
		if (!isset($this->permissions)) {
			$this->permissions = $this->permissions()->get();
		}
		return $this->permissions;
	}

	/**
	 * Get all editable roles
	 *
	 * @return Builder[]|\Illuminate\Database\Eloquent\Collection
	 */
	private function getRoles()
	{
		if (!isset($this->roles)) {
			$this->roles = $this->roles()
				->with('permissions')
				->withCount('users')
				->get();
		}
		return $this->roles;
	}

	/**
	 * Validate role attributes
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateRole($request)
	{
		return $this->validate($request, [
			'name'  => 'required|string|min:3|max:15',
			'level' => 'required|numeric|min:1|max:99'
		]);
	}

	/**
	 * Validate permission requirements
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validatePermissions($request)
	{
		$permissions = $this->getPermissions();
		$rules = [];

		$requirements = config()->get('permission.requirements');

		foreach ((array) $requirements as $key => $data) {
			if ($permissions->contains('name', $key)) {
				foreach ($data as $permission) {
					if ($permissions->contains('name', $permission)) {
						$rules[$permission][] = "required_if:{$key},true";
					}
				}
			}
		}

		return $this->validate($request, $rules);
	}

	/**
	 * Create new role
	 *
	 * @param Request $request
	 * @return Role|\Illuminate\Database\Eloquent\Model
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function create(Request $request)
	{
		$this->validatePermissions($request);
		$this->validateRole($request);

		$permissions = $this->getPermissions()->pluck('name')->toArray();
		$selected = collect($request->only($permissions))->filter();

		$role = Role::create([
			'name'  => $request->get('name'),
			'level' => $request->get('level')
		]);

		$role->syncPermissions($selected->keys()->toArray());
		return $role->loadMissing('permissions');
	}

	/**
	 * Update role
	 *
	 * @param Request $request
	 * @param Role $role
	 * @return Builder|Builder[]|\Illuminate\Database\Eloquent\Collection|\Illuminate\Database\Eloquent\Model
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function update(Request $request, $role)
	{
		$role = $this->roles()->findOrFail($role);
		$this->validateRole($request);
		$this->validatePermissions($request);

		$permissions = $this->getPermissions()->pluck('name')->toArray();
		$selected = collect($request->only($permissions))->filter();

		$role->update([
			'name'  => $request->get('name'),
			'level' => $request->get('level')
		]);

		$role->syncPermissions($selected->keys()->toArray());
		return $role->loadMissing('permissions');
	}

	/**
	 * Delete role
	 *
	 * @param Role $role
	 * @return void
	 * @throws \Exception
	 */
	public function delete($role)
	{
		$role = $this->roles()->findOrFail($role);
		$role->delete();
	}

	/**
	 * Editable role query
	 *
	 * @return Builder
	 */
	private function roles()
	{
		$superAdmin = config()->get('permission.super_admin_role');
		return Role::where('name', '!=', $superAdmin);
	}

	/**
	 * Assignable permissions query
	 *
	 * @return Builder
	 */
	private function permissions()
	{
		return Permission::query();
	}
}
