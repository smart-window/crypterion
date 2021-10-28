<?php

namespace App\Http\Controllers\Admin\Settings\Configuration;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MarketplaceController extends Controller
{
	/**
	 * Get marketplace data
	 *
	 * @return array
	 */
	public function data()
	{
		$settings = settings('marketplace');
		$keys = collect($this->properties())->keys();
		return $settings->only($keys->toArray());
	}

	/**
	 * Validate properties
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateProperties(Request $request)
	{
		$rules = collect($this->properties())
			->map(function ($data) {
				return $data['rules'] ?? null;
			})->filter()->toArray();

		return $this->validate($request, $rules);
	}

	/**
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function update(Request $request)
	{
		$this->validateProperties($request);

		$properties = collect($this->properties());
		$settings = settings('marketplace');

		$values = $properties->map(function ($data, $key) use ($request) {
			$value = $request->get($key);

			if (isset($data['parse']) && is_callable($data['parse'])) {
				$value = $data['parse']($value);
			}

			return $value;
		});

		$settings->update($values->toArray());
		$keys = $properties->keys();
		return $settings->only($keys->toArray());
	}

	/**
	 * Marketplace properties
	 *
	 * @return array
	 */
	public function properties()
	{
		return [
			'min_offer_amount'   => [
				'rules' => 'required|numeric|min:1'
			],
			'max_offer_amount'   => [
				'rules' => 'required|numeric|gt:min_offer_amount'
			],
			'offer_cache_period' => [
				'rules' => 'required|numeric|min:1|max:30'
			],
		];
	}
}
