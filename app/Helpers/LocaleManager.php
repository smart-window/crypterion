<?php

namespace App\Helpers;


use Barryvdh\TranslationManager\Manager;
use Illuminate\Contracts\Translation\Loader;
use Illuminate\Support\Facades\File;

class LocaleManager
{
	protected $path;

	/**
	 * Cache loaded locale lines
	 *
	 * @var array|null
	 */
	protected $loadedLines;

	/**
	 * @var Loader
	 */
	protected $loader;

	/**
	 * @var Manager
	 */
	protected $manager;

	/**
	 * LocaleManager constructor.
	 */
	public function __construct()
	{
		$this->loader = app('translation.loader');
		$this->path = resource_path('lang');
		$this->manager = app('translation-manager');
	}

	/**
	 * @return array
	 */
	public function getSupportedLocales()
	{
		$availableLocales = $this->getAvailableLocales();
		$locales = $this->manager->getLocales();
		return array_intersect($locales, $availableLocales);
	}

	/**
	 * @return array
	 */
	public function getSupportedLocalesData()
	{
		$locales = $this->getSupportedLocales();
		$data = config()->get('locales');

		return collect($data)->only($locales)
			->mapWithKeys(function ($item, $key) {
				[$locale, $region] = explode('_', $item['regional']);

				return [
					$key => [
						'name'   => $item['name'],
						'native' => $item['native'],
						'region' => strtolower($region),
						'locale' => $locale
					]
				];
			})->toArray();
	}

	/**
	 * Get array of locales based on available files
	 *
	 * @return array
	 */
	protected function getAvailableLocales()
	{
		return collect(File::files($this->path))
			->filter(function ($value) {
				return preg_match('/^.*\.(json)$/i', $value);
			})->map(function ($value) {
				return basename($value, '.json');
			})->toArray();
	}

	/**
	 * Get translation lines as array
	 *
	 * @param $locale
	 * @return mixed
	 */
	public function getLines($locale = null)
	{
		if (!$locale) {
			$locale = app()->getLocale();
		}

		$this->loadLines($locale);

		return $this->loadedLines[$locale];
	}

	/**
	 * Load json files as array
	 *
	 * @param $locales
	 */
	public function loadLines($locales)
	{
		$locales = !is_array($locales) ? [$locales] : $locales;

		foreach ($locales as $locale) {
			if (isset($this->loadedLines[$locale])) {
				continue;
			}

			$line = $this->loader->load($locale, '*', '*');
			$this->loadedLines[$locale] = $line;
		}
	}
}