<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\User as UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
	/**
	 * Add user to authenticated contacts
	 *
	 * @param Request $request
	 * @param $name
	 */
	public function add(Request $request, $name)
	{
		$contact = User::findOrFail($request->id);
		$user = $this->findUserByName($name);

		if($user->contacts()->find($contact->id)){
			abort(422, trans('auth.already_a_contact'));
		}

		$user->contacts()->attach($contact->id);
	}

	/**
	 * Remove user from authenticated contacts
	 *
	 * @param Request $request
	 * @param $name
	 */
	public function remove(Request $request, $name)
	{
		$contact = User::findOrFail($request->id);
		$user = $this->findUserByName($name);
		$user->contacts()->detach($contact->id);
	}

	/**
	 * Remove all from authenticated contacts
	 *
	 * @param Request $request
	 * @param $name
	 */
	public function batchRemove(Request $request, $name)
	{
		$user = $this->findUserByName($name);
		$users = $request->get('users', []);
		$user->contacts()->detach($users);
	}

	/**
	 * Add contacts to trusted list
	 *
	 * @param Request $request
	 * @param $name
	 * @return UserResource
	 */
	public function trust(Request $request, $name)
	{
		$user = $this->findUserByName($name);
		$contact = $user->contacts()->find($request->id);

		if(!$contact){
			abort(422, trans('auth.contact_doesnt_exist'));
		}

		$contact->pivot->update(['status' => 'trust']);
		return new UserResource($contact);
	}

	/**
	 * Add contacts to blocked list
	 *
	 * @param Request $request
	 * @param $name
	 * @return UserResource
	 */
	public function block(Request $request, $name)
	{
		$user = $this->findUserByName($name);
		$contact = $user->contacts()->find($request->id);

		if(!$contact){
			abort(422, trans('auth.contact_doesnt_exist'));
		}

		$contact->pivot->update(['status' => 'block']);
		return new UserResource($contact);
	}

	/**
	 * Remove contacts from blocked list
	 *
	 * @param Request $request
	 * @param $name
	 * @return UserResource
	 */
	public function resetStatus(Request $request, $name)
	{
		$user = $this->findUserByName($name);
		$contact = $user->contacts()->find($request->id);

		if(!$contact){
			abort(422, trans('auth.contact_doesnt_exist'));
		}

		$contact->pivot->update(['status' => null]);
		return new UserResource($contact);
	}

	/**
	 * @param Request $request
	 * @param $name
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function table(Request $request, $name)
	{
		$contacts = $this->findUserByName($name)
			->contacts()->latest();

		$filters = $request->get('filters', []);

		if (array_has($filters, 'status') && $filters['status']) {
			$contacts = $contacts->wherePivot('status', $filters['status']);
		}

		$results = paginateResult(
			$contacts,
			$request->get('itemPerPage', 10),
			$request->get('page'),
			array_only($filters, ['name'])
		);

		return UserResource::collection($results);
	}

	/**
	 * @param $name
	 * @return \App\Models\User
	 */
	private function findUserByName($name)
	{
		$user = User::where('name', $name)
			->firstOrFail();

		if(!Auth::user()->canEdit($user)){
			abort(403, trans('auth.access_forbidden'));
		}else{
			return $user;
		}
	}
}
