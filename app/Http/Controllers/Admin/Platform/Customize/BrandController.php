<?php

namespace App\Http\Controllers\Admin\Platform\Customize;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
	/**
	 * Upload logo icon
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function uploadLogoIcon(Request $request)
	{
		if (config('app.live_preview')) {
			return abort(403, 'Not Available');
		}

		$this->validate($request, [
			'file' => [
				'required', 'file', 'mimetypes:image/png',
				Rule::dimensions()
					->maxWidth(100)->maxHeight(100)
			]
		]);

		$file = $request->file('file');
		$fileName = 'logo-icon.' . $file->extension();
		$path = $this->fileStoragePath();
		$file->storePubliclyAs($path, $fileName, [
			'disk' => 'public'
		]);

		$hash = str_random(5);

		settings('brand')->update([
			'logo_icon_url' => "storage/{$path}/{$fileName}?id={$hash}"
		]);
	}

	/**
	 * Upload logo
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function uploadLogo(Request $request)
	{
		if (config('app.live_preview')) {
			return abort(403, 'Not Available');
		}

		$this->validate($request, [
			'file' => [
				'required', 'file', 'mimetypes:image/png',
				Rule::dimensions()->maxWidth(550)->maxHeight(150)
			]
		]);

		$file = $request->file('file');
		$fileName = 'logo.' . $file->extension();
		$path = $this->fileStoragePath();
		$file->storePubliclyAs($path, $fileName, [
			'disk' => 'public'
		]);

		$hash = str_random(5);

		settings('brand')->update([
			'logo_url' => "storage/{$path}/{$fileName}?id={$hash}"
		]);
	}

	/**
	 * Upload logo dark
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function uploadLogoDark(Request $request)
	{
		if (config('app.live_preview')) {
			return abort(403, 'Not Available');
		}

		$this->validate($request, [
			'file' => [
				'required', 'file', 'mimetypes:image/png',
				Rule::dimensions()->maxWidth(550)->maxHeight(150)
			]
		]);

		$file = $request->file('file');
		$fileName = 'logo-dark.' . $file->extension();
		$path = $this->fileStoragePath();
		$file->storePubliclyAs($path, $fileName, [
			'disk' => 'public'
		]);

		$hash = str_random(5);

		settings('brand')->update([
			'logo_dark_url' => "storage/{$path}/{$fileName}?id={$hash}"
		]);
	}

	/**
	 * Upload favicon
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function uploadFavicon(Request $request)
	{
		if (config('app.live_preview')) {
			return abort(403, 'Not Available');
		}

		$this->validate($request, [
			'file' => ['required', 'file', 'mimetypes:image/x-icon']
		]);

		$file = $request->file('file');
		$fileName = 'favicon.' . $file->extension();
		$path = $this->fileStoragePath();
		$file->storePubliclyAs($path, $fileName, [
			'disk' => 'public'
		]);

		$hash = str_random(5);

		settings('brand')->update([
			'favicon_url' => "storage/{$path}/{$fileName}?id={$hash}"
		]);
	}

	/**
	 * Get file path
	 *
	 * @return string
	 */
	protected function fileStoragePath()
	{
		return "brand";
	}
}
