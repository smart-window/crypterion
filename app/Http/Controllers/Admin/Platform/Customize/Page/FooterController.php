<?php

namespace App\Http\Controllers\Admin\Platform\Customize\Page;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FooterController extends Controller
{
	/**
	 * Get footer body
	 *
	 * @return array
	 */
	public function data()
	{
		return [
			'body' => settings('page')->footer
		];
	}

	/**
	 * Update footer
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function update(Request $request)
	{
		$this->validate($request, [
			'body' => 'required|string'
		]);

		settings('page')->update([
			'footer' => $request->get('body')
		]);
	}
}
