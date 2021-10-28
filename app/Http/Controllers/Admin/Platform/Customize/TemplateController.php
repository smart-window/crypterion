<?php

namespace App\Http\Controllers\Admin\Platform\Customize;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TemplateController extends Controller
{
	/**
	 * Set layout type
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function setLayoutType(Request $request)
	{
		$this->validate($request, [
			'type' => 'required|string'
		]);

		$type = $request->get('type');

		settings('template')->update([
			'layout_type' => $type
		]);
	}


	/**
	 * Set nav styles
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function setNavStyle(Request $request)
	{
		$this->validate($request, [
			'style' => 'required|string'
		]);

		$style = $request->get('style');

		settings('template')->update([
			'nav_style' => $style
		]);
	}

	/**
	 * Set color palettes
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function setColorPalettes(Request $request)
	{
		$this->validate($request, [
			'palettes' => 'required|array'
		]);

		$palettes = array_merge(
			settings('template')->color_palettes,
			$request->get('palettes')
		);

		settings('template')->update([
			'color_palettes' => $palettes
		]);
	}

	/**
	 * Set theme types
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function setThemeType(Request $request)
	{
		$this->validate($request, [
			'type' => 'required|string'
		]);

		$type = $request->get('type');

		settings('template')->update([
			'theme_type' => $type
		]);
	}
}
