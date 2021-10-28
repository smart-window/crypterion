<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use App\Models\Widget;
use Illuminate\Http\Request;

class WidgetController extends Controller
{
	/**
	 * Get all widgets list
	 *
	 * @param $category
	 * @return Widget[]
	 */
	public function list()
	{
		return $this->widgets()->orderBy('order')->get();
	}

	/**
	 * Set dimensions
	 *
	 * @param Request $request
	 * @param $category
	 */
	public function setDimensions(Request $request)
	{
		if (config('app.live_preview')) {
			return abort(403, 'Not Available');
		}

		$data = $request->get('dimensions');

		foreach ($data as $name => $dimensions) {
			$widget = $this->widgets()
				->where('name', $name)->first();

			if ($widget) {
				$widget->dimensions = $dimensions;
				$widget->save();
			}
		}
	}

	/**
	 * Widget query
	 *
	 * @return Widget|\Illuminate\Database\Eloquent\Builder
	 */
	public function widgets()
	{
		return Widget::where('category', 'index.home')
			->where('enabled', true);
	}
}
