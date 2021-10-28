<?php

namespace App\Http\Controllers;

use App\Helpers\LocaleManager;
use ArrayObject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
	protected $localeManager;

	/**
	 * SessionController constructor.
	 * @param LocaleManager $localeManager
	 */
	public function __construct(LocaleManager $localeManager)
	{
		$this->localeManager = $localeManager;
	}

	/**
	 * @param Request $request
	 * @return \Illuminate\Http\JsonResponse
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function set(Request $request)
	{
		$locales = $this->localeManager->getSupportedLocales();

		$this->validate($request, [
			'locale' => ['required', Rule::in($locales)]
		]);

		$locale = $request->get('locale');
		$messages = $this->localeManager->getLines($locale);

        session()->put('locale', $locale);

		return response()->json([
			'locale'   => $locale,
			'messages' => new ArrayObject($messages)
		]);
	}

	/**
	 * @return \Illuminate\Http\JsonResponse
	 */
	public function get()
	{
		$locale = session()->get('locale', app()->getLocale());

		$messages = $this->localeManager->getLines($locale);

		return response()->json([
			'locale'   => $locale,
			'messages' => new ArrayObject($messages)
		]);
	}
}
