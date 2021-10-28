<?php

namespace App\Http\Controllers\Admin\Settings\Marketplace;

use App\Models\MarketplaceTag;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TagController extends Controller
{
	/**
	 * Get all tags
	 *
	 * @return array
	 */
	public function list()
	{
		return $this->marketplaceTags()->get();
	}

	/**
	 * Validate marketplace tag attribute
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateTag(Request $request)
	{
		return $this->validate($request, [
			'name'        => 'required|string|max:250',
			'description' => 'required|string|max:250',
		]);
	}

	/**
	 * Create marketplace tag
	 *
	 * @param Request $request
	 * @return MarketplaceTag|\Illuminate\Database\Eloquent\Model
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function create(Request $request)
	{
		$this->validateTag($request);

		return MarketplaceTag::create([
			'name'        => $request->get('name'),
			'description' => $request->get('description'),
		]);
	}

	/**
	 * Update marketplace tag
	 *
	 * @param Request $request
	 * @param MarketplaceTag $tag
	 * @return MarketplaceTag
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function update(Request $request, MarketplaceTag $tag)
	{
		$this->validateTag($request);

		$tag->update([
			'name'        => $request->get('name'),
			'description' => $request->get('description'),
		]);
		return $tag;
	}

	/**
	 * Delete marketplace tag
	 *
	 * @param MarketplaceTag $tag
	 * @throws \Exception
	 */
	public function delete(MarketplaceTag $tag)
	{
		$tag->delete();
	}

	/**
	 * Marketplace Tag query
	 *
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	protected function marketplaceTags()
	{
		return MarketplaceTag::latest();
	}
}
