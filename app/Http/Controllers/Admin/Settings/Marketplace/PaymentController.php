<?php

namespace App\Http\Controllers\Admin\Settings\Marketplace;

use App\Models\Coin;
use App\Models\Fee;
use App\Models\PaymentMethod;
use App\Models\PaymentMethodCategory;
use App\Models\Wallet;
use function foo\func;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
	/**
	 * @var array
	 */
	protected $coins;

	/**
	 * Get payment data
	 *
	 * @return array
	 */
	public function data()
	{
		$methodCategories = $this->paymentMethodCategories()->get();
		$methods = $this->paymentMethods()->with(['walletFees'])->get();
		return [
			'methods'           => $methods,
			'method_categories' => $methodCategories,
		];
	}

	/**
	 * Create method payment caegory
	 *
	 * @param Request $request
	 * @return PaymentMethodCategory|\Illuminate\Database\Eloquent\Model
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function createMethodCategory(Request $request)
	{
		$this->validateMethodCategory($request);

		return PaymentMethodCategory::create([
			'name'        => $request->get('name'),
			'description' => $request->get('description'),
		]);
	}

	/**
	 * Delete method category
	 *
	 * @param PaymentMethodCategory $category
	 * @throws \Exception
	 */
	public function deleteMethodCategory(PaymentMethodCategory $category)
	{
		$category->delete();
	}

	/**
	 * Update payment method category
	 *
	 * @param Request $request
	 * @param PaymentMethodCategory $category
	 * @return PaymentMethodCategory
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function updateMethodCategory(Request $request, PaymentMethodCategory $category)
	{
		$this->validateMethodCategory($request);

		$category->update([
			'name'        => $request->get('name'),
			'description' => $request->get('description'),
		]);
		return $category;
	}

	/**
	 * Validate payment method attributes
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateMethodCategory(Request $request)
	{
		return $this->validate($request, [
			'name'        => 'required|string|max:250',
			'description' => 'required|string|max:250'
		]);
	}

	/**
	 * Validate payment method attributes
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateMethod(Request $request)
	{
		return $this->validate($request, [
			'name'        => 'required|string|max:250',
			'description' => 'required|string|max:250',
			'category'    => 'required|exists:payment_method_categories,id'
		]);
	}

	/**
	 * Validate marketplace fees
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	protected function validateMarketplaceFees(Request $request)
	{
		$rules = $this->getCoins()->pluck('identifier')
			->mapWithKeys(function ($value) {
				return [$value => "nullable|numeric|min:0|max:100"];
			});

		$this->validate($request, $rules->toArray());
	}

	/**
	 * Create new payment method
	 *
	 * @param Request $request
	 * @return PaymentMethod
	 * @throws \Illuminate\Validation\ValidationException
	 * @throws \Throwable
	 */
	public function createMethod(Request $request)
	{
		return DB::transaction(function () use ($request) {
			$this->validateMarketplaceFees($request);
			$this->validateMethod($request);

			$categoryId = $request->get('category');
			$category = PaymentMethodCategory::findOrFail($categoryId);

			$method = new PaymentMethod([
				'name'        => $request->get('name'),
				'description' => $request->get('description'),
			]);

			$method->category()->associate($category);
			$method->save();

			$coins = $this->getCoins()
				->pluck('identifier')->toArray();

			collect($request->only($coins))
				->filter()
				->each(function ($value, $key) use ($method) {
					$wallet = $this->wallets()
						->whereHas('coin', function ($query) use ($key) {
							$query->where('identifier', $key);
						})->first();

					if ($wallet) {
						$fee = new Fee([
							'marketplace_fee' => $value
						]);
						$fee->wallet()->associate($wallet);
						$method->walletFees()->save($fee);
					}
				});
			return $method;
		});
	}

	/**
	 * Delete payment method
	 *
	 * @param PaymentMethod $method
	 * @throws \Exception
	 */
	public function deleteMethod(PaymentMethod $method)
	{
		$method->delete();
	}

	/**
	 * Update payment method
	 *
	 * @param Request $request
	 * @param PaymentMethod $method
	 * @return PaymentMethod
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function updateMethod(Request $request, PaymentMethod $method)
	{
		$this->validateMarketplaceFees($request);
		$this->validateMethod($request);

		$categoryId = $request->get('category');
		$category = PaymentMethodCategory::findOrFail($categoryId);

		$method->fill([
			'name'        => $request->get('name'),
			'description' => $request->get('description'),
		]);

		$method->category()->associate($category);
		$method->save();

		$coins = $this->getCoins()
			->pluck('identifier')->toArray();

		collect($request->only($coins))
			->filter()
			->each(function ($value, $key) use ($method) {
				$wallet = $this->wallets()
					->whereHas('coin', function ($query) use ($key) {
						$query->where('identifier', $key);
					})->first();

				if ($wallet) {
					$fee = $method->walletFees()
						->whereHas('wallet', function ($query) use ($wallet) {
							$query->where('id', $wallet->id);
						})->first();

					if ($fee) {
						$fee->fill([
							'marketplace_fee' => $value
						]);
					} else {
						$fee = new Fee([
							'marketplace_fee' => $value
						]);
						$fee->wallet()->associate($wallet);
					}
					$method->walletFees()->save($fee);
				}
			});

		return $method;
	}

	/**
	 * Get all coin models
	 *
	 * @return array|\Illuminate\Database\Eloquent\Builder[]|\Illuminate\Database\Eloquent\Collection
	 */
	protected function getCoins()
	{
		if (!isset($this->coins)) {
			$this->coins = $this->coins()->get();
		}
		return $this->coins;
	}

	/**
	 * Coins query
	 *
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	protected function coins()
	{
		return Coin::latest();
	}


	/**
	 * Wallets query
	 *
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	protected function wallets()
	{
		return Wallet::latest();
	}

	/**
	 * Payment Methods query
	 *
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	public function paymentMethods()
	{
		return PaymentMethod::latest();
	}

	/**
	 * Payment Method Categories query
	 *
	 * @return \Illuminate\Database\Eloquent\Builder
	 */
	public function paymentMethodCategories()
	{
		return PaymentMethodCategory::latest();
	}
}
