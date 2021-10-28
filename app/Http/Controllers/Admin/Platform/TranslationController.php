<?php

namespace App\Http\Controllers\Admin\Platform;

use App\Http\Controllers\Controller;
use Barryvdh\TranslationManager\Manager;
use Barryvdh\TranslationManager\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Jackiedo\DotenvEditor\DotenvEditor;

class TranslationController extends Controller
{
	/**
	 * @var DotenvEditor
	 */
	protected $editor;

	/**
	 * @var Manager
	 */
	protected $manager;

	/**
	 * GeneralController constructor.
	 *
	 * @param Manager $manager
	 * @param DotenvEditor $editor
	 * @throws \Exception
	 */
	public function __construct(DotenvEditor $editor, Manager $manager)
	{
		$this->editor = $editor;
		$this->manager = $manager;
	}

	/**
	 * Get translation data
	 *
	 * @return array
	 */
	public function data()
	{
		return [
			'locales' => $this->availableLocalesData(),
			'groups'  => $this->availableGroups()
		];
	}

	/**
	 * Get translation data by group
	 *
	 * @param null $group
	 * @return array
	 */
	public function groupData($group)
	{
		return [
			'locales'       => array_values($this->manager->getLocales()),
			'total'         => $this->totalGroupKeys($group),
			'total_changed' => $this->totalChangedGroupKeys($group),
		];
	}

	/**
	 * Get paginated result of group translation keys
	 *
	 * @param Request $request
	 * @param $group
	 * @return LengthAwarePaginator
	 */
	public function groupTable(Request $request, $group)
	{
		$records = Translation::where('group', $group)->orderBy('key', 'asc');
		$filters = $request->get('filters', []);

		if (array_has($filters, 'value') && $filters['value']) {
			$records->where('value', 'like', "%{$filters['value']}%");
		}

		$records = $records->paginate(
			$request->get('itemPerPage'), ['*'], 'page', $request->get('page')
		);

		$translations = [];
		foreach ($records->items() as $record) {
			$data = array_except($record->toArray(), ['group', 'locale', 'key']);
			$translations[$record->key][$record->locale] = $data;
		}

		$translations = collect($translations)->map(function ($value, $key) {
			return array_merge($value, ['key' => $key]);
		})->values();

		return new LengthAwarePaginator(
			$translations, $records->total(), $records->perPage(), $records->currentPage(),
			[
				'path' => Paginator::resolveCurrentPath(),
			]
		);
	}

	/**
	 * Export group keys
	 *
	 * @param $group
	 */
	public function groupExport($group)
	{
		if (config('app.live_preview')) {
			return abort(403, 'Not Available');
		}

		$json = $group === "_json";

		$this->manager->exportTranslations($group, $json);
	}

	/**
	 * Update group key
	 *
	 * @param Request $request
	 * @param $group
	 * @return Collection
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function groupUpdate(Request $request, $group)
	{
		$rules = ['key' => 'required|string'];
		$locales = $this->manager->getLocales();

		foreach ($locales as $locale) {
			$rules = array_merge($rules, [$locale => 'required|string']);
		}

		$this->validate($request, $rules);

		$key = $request->get('key');
		$response = collect(['key' => $key]);

		foreach ($locales as $locale) {
			$translation = Translation::firstOrNew([
				'group'  => $group,
				'locale' => $locale,
				'key'    => $key,
			]);

			$translation->value = $request->get($locale);
			$translation->status = Translation::STATUS_CHANGED;
			$translation->save();

			$data = array_except($translation->toArray(), ['group', 'locale', 'key']);

			$response->put($locale, $data);
		}
		return $response;
	}

	/**
	 * Count group keys
	 *
	 * @param null $group
	 * @return mixed
	 */
	protected function totalGroupKeys($group)
	{
		return Translation::where('group', $group)->count();
	}

	/**
	 * Count changed group keys
	 *
	 * @param null $group
	 * @return mixed
	 */
	protected function totalChangedGroupKeys($group)
	{
		return Translation::where('group', $group)
			->where('status', Translation::STATUS_CHANGED)
			->count();
	}

	/**
	 * Get available groups
	 *
	 * @return array
	 */
	protected function availableGroups()
	{
		$groups = Translation::select('group');

		if ($excluded = $this->manager->getConfig('exclude_groups')) {
			$groups->whereNotIn('group', $excluded);
		}

		return $groups->groupBy('group')
			->orderBy('group')->get()->pluck('group');
	}

	/**
	 * Get available locales data
	 *
	 * @return array|Collection
	 */
	protected function availableLocalesData()
	{
		$data = config()->get('locales');
		$available = $this->manager->getLocales();

		return collect($data)->only($available)
			->map(function ($value, $key) {
				return array_merge($value, ['locale' => $key]);
			})->values();
	}

	/**
	 * Add locale
	 *
	 * @param Request $request
	 * @return void
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function addLocale(Request $request)
	{
		$data = config()->get('locales');

		$this->validate($request, [
			'locale' => ['required', Rule::in(array_keys($data))]
		]);

		$locale = $request->get('locale');
		$locales = $this->availableLocalesData();

		if ($locales->contains('locale', $locale)) {
			return abort(400, trans('common.locale_exists'));
		}

		$this->manager->addLocale($locale);
	}

	/**
	 * Remove locale
	 *
	 * @param Request $request
	 * @return mixed
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function removeLocale(Request $request)
	{
		$this->validate($request, [
			'locale' => ['required', Rule::notIn(['en'])]
		]);

		$locale = $request->get('locale');

		$this->manager->removeLocale($locale);
	}

	/**
	 * Import translation keys
	 *
	 * @param Request $request
	 * @return
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function import(Request $request)
	{
		$this->validate($request, [
			'type' => 'required|boolean'
		]);

		$type = (bool) $request->get('type');

		$total = $this->manager->importTranslations($type);

		return compact('total');
	}
}
