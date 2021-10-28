<?php

namespace App\Http\Controllers\Admin\Platform\Customize;

use App\Http\Controllers\Controller;
use App\Models\Widget;
use Illuminate\Http\Request;

class WidgetController extends Controller
{
	/**
	 * Get Widget data
	 *
	 * @param $category
	 * @return \Illuminate\Support\Collection
	 */
    public function data($category)
    {
	    return $this->widgets()
		    ->where('category', $category)->get();
    }

	/**
	 * Enable Widgets
	 *
	 * @param Request $request
	 * @param $category
	 * @return \Illuminate\Support\Collection
	 */
    public function toggleEnabled(Request $request, $category)
    {
	    if (config('app.live_preview')) {
		    return abort(403, 'Not Available');
	    }

    	$names = $request->get('names', []);

	     $this->widgets()
		     ->where('category', $category)
		    ->whereIn('name', $names)
		    ->update(['enabled' => true]);

	     $this->widgets()
		     ->where('category', $category)
		    ->whereNotIn('name', $names)
		    ->update(['enabled' => false]);

	     return $this->widgets()
		     ->where('category', $category)->get();
    }

	/**
	 * Widget query
	 *
	 * @return Widget|\Illuminate\Database\Eloquent\Builder|\Illuminate\Database\Query\Builder
	 */
	public function widgets()
	{
		return Widget::orderBy('name');
	}
}
