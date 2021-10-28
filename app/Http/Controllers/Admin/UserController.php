<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Notifications\Auth\UserActivated;
use App\Notifications\Auth\UserDeactivated;
use App\Notifications\Auth\UserDeleted;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
	/**
	 * Activate user
	 *
	 * @param User $user
	 * @return User
	 * @throws \Throwable
	 */
	public function activate(User $user)
	{
		if (!Auth::user()->canManage($user)) {
			abort(403, trans('auth.action_forbidden'));
		}

		$user->update([
			'scheduled_deactivate' => null,
			'inactive_until'       => null,
		]);

		$user->notify(new UserActivated());
		return $user;
	}

	/**
	 * Activate Batch users
	 *
	 * @param Request $request
	 */
	public function batchActivate(Request $request)
	{
		$users = $request->get('users', []);

		User::whereIn('id', $users)
			->get()->each(function (User $user) {
				if (Auth::user()->canManage($user)) {
					$user->update([
						'scheduled_deactivate' => null,
						'inactive_until'       => null,
					]);

					$user->notify(new UserActivated());
				}
			});
	}

	/**
	 * Deactivate user
	 *
	 * @param User $user
	 * @param Request $request
	 * @return User
	 * @throws \Throwable
	 */
	public function deactivate(User $user, Request $request)
	{
		if (!Auth::user()->canManage($user)) {
			abort(403, trans('auth.action_forbidden'));
		}

		$date = $request->get('date');

		if ($user->canBeDeactivated()) {
			$user->update([
				'inactive_until' => Carbon::parse($date)
			]);
			$user->notify(new UserDeactivated());
		} else {
			$user->update([
				'scheduled_deactivate' => Carbon::parse($date)
			]);
		}
		return $user;
	}

	/**
	 * Deactivate batch users
	 *
	 * @param Request $request
	 */
	public function batchDeactivate(Request $request)
	{
		$users = $request->get('users', []);
		$date = $request->get('date');

		User::whereIn('id', $users)
			->get()->each(function (User $user) use ($date) {
				if (Auth::user()->canManage($user)) {
					if ($user->canBeDeactivated()) {
						$user->update([
							'inactive_until' => Carbon::parse($date)
						]);
						$user->notify(new UserDeactivated());
					} else {
						$user->update([
							'scheduled_deactivate' => Carbon::parse($date)
						]);
					}
				}
			});
	}

	/**
	 * Change User Role
	 *
	 * @param User $user
	 * @param Request $request
	 * @return User
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function changeRole(User $user, Request $request)
	{
		if (!Auth::user()->canChangeRole($user)) {
			abort(403, trans('auth.action_forbidden'));
		}

		$this->validate($request, [
			'roles.*' => [Rule::in($this->getRoles()->pluck('name'))]
		]);

		$user->syncRoles($request->get('roles'));
		return $user;
	}

	/**
	 * Delete user
	 *
	 * @param User $user
	 * @param Request $request
	 * @throws \Exception
	 * @throws \Throwable
	 */
	public function delete(User $user)
	{
		if (!Auth::user()->canManage($user)) {
			abort(403, trans('auth.action_forbidden'));
		}

		if ($user->canBeDeleted()) {
			$user->delete();
			$user->notify(new UserDeleted());
		} else {
			$user->update([
				'scheduled_delete' => true
			]);
		}
	}

	/**
	 * Delete batch users
	 *
	 * @param Request $request
	 */
	public function batchDelete(Request $request)
	{
		$users = $request->get('users', []);

		User::whereIn('id', $users)
			->get()->each(function (User $user) {
				if (Auth::user()->canManage($user)) {
					if ($user->canBeDeleted()) {
						$user->delete();
						$user->notify(new UserDeleted());
					} else {
						$user->update([
							'scheduled_delete' => true
						]);
					}
				}
			});
	}

	/**
	 * @param Request $request
	 * @return User[]|\Illuminate\Database\Eloquent\Collection
	 */
	public function table(Request $request)
	{
		$users = User::query()->latest();
		$filters = $request->get('filters', []);

		if (array_has($filters, 'role') && $filters['role']) {
			$users->whereHas('roles', function (Builder $query) use ($filters) {
				$query->where('name', $filters['role']);
			});
		}

		if (array_has($filters, 'status')) {
			switch ($filters['status']) {
				case 'inactive':
					$users->whereNotNull('inactive_until')
						->where('inactive_until', '>=', now());
					break;
				case 'active':
					$users->where(function (Builder $query) {
						$query->whereNull('inactive_until')
							->orWhere('inactive_until', '<', now());
					});
					break;
			}
		}

		return paginateResult(
			$users,
			$request->get('itemPerPage', 10),
			$request->get('page'),
			array_only($filters, ['name'])
		);
	}

	/**
	 * Get assignable roles
	 *
	 * @return Role[]|\Illuminate\Database\Eloquent\Collection
	 */
	public function roles()
	{
		return $this->getRoles();
	}

	/**
	 * Get assignable roles
	 *
	 * @return Builder[]|\Illuminate\Database\Eloquent\Collection
	 */
	private function getRoles()
	{
		$superAdmin = config()->get('permission.super_admin_role');

		return Role::where('name', '!=', $superAdmin)->get();
	}
}
