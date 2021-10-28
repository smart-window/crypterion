<?php

namespace App\Http\Controllers;

use App\Http\Resources\Rating as RatingResource;
use App\Http\Resources\User as UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
	/**
	 * Get public user object by name
	 *
	 * @param $name
	 * @return UserResource
	 */
	public function get($name)
	{
		return new UserResource($this->findUserByName($name));
	}

	/**
	 * Get private user object by name
	 *
	 * @param $name
	 * @return User
	 */
	public function data($name)
	{
		$user = $this->findUserByName($name);

		if (!Auth::user()->canEdit($user)) {
			abort(403, trans('auth.access_forbidden'));
		} else {
			return $user;
		}
	}

	/**
	 * @param Request $request
	 * @return mixed
	 */
	public function auth()
	{
		return Auth::user();
	}

	/**
	 * @param Request $request
	 * @param $name
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function marketplaceRatings(Request $request, $name)
	{
		$marketplaceRatings = $this->findUserByName($name)
			->marketplaceRatings()->latest();

		$filters = $request->get('filters', []);

		$results = paginateResult(
			$marketplaceRatings,
			$request->get('itemPerPage', 10),
			$request->get('page'),
			array_only($filters, ['comment', 'rating'])
		);

		return RatingResource::collection($results);
	}

	/**
	 * @param $name
	 * @return \App\Models\User
	 */
	private function findUserByName($name)
	{
		return User::where('name', $name)->firstOrFail();
	}

	/**
	 * @param Request $request
	 * @return mixed
	 */
	public function transferRecordsTable(Request $request)
	{
		$transferRecords = Auth::user()->transferRecords()->latest();

		$filters = $request->get('filters', []);

		return paginateResult(
			$transferRecords,
			$request->get('itemPerPage', 10),
			$request->get('page'),
			array_only($filters, ['value', 'type', 'confirmations'])
		);
	}

	/**
	 * Update presence as online
	 */
	public function setOnline()
	{
		Auth::user()->updatePresence("online");
	}

	/**
	 * Update presence as away
	 */
	public function setAway()
	{
		Auth::user()->updatePresence("away");
	}

	/**
	 * Update presence as offline
	 */
	public function setOffline()
	{
		Auth::user()->updatePresence("offline");
	}
}
