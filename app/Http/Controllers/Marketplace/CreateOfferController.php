<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceOffer;
use App\Models\PaymentMethod;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CreateOfferController extends Controller
{
	/**
	 * Get currency price
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function price(Request $request)
	{
		$this->validate($request, [
			'wallet'   => 'required|exists:wallets,id',
			'currency' => [
				'required',
				Rule::in($this->getCurrencies()->keys()->toArray())
			],
		]);

		$currency = $request->get('currency');
		$wallet = Wallet::findOrFail($request->get('wallet'));
		$value = $wallet->coin->getValueObject();

		return [
			'formatted_price' => $value->getFormattedPrice($currency),
			'price'           => $value->getPrice($currency),
		];
	}

	/**
	 * Create a buy offer
	 *
	 * @param Request $request
	 * @return \Illuminate\Database\Eloquent\Model
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function buy(Request $request)
	{
		$this->validateInput($request);
		$this->validate($request, ['max_amount' => 'required']);
		$attributes = $this->getAttributes($request);
		$attributes['type'] = 'buy';

		if ($id = $request->id) {
			$offer = $this->getOffer($id);
			$offer->fill($attributes)->save();
			return $offer;
		} else {
			return Auth::user()->marketplaceOffers()
				->create($attributes);
		}

	}

	private function getAttributes(Request $request)
	{
		return [
			'wallet_account_id'          => $request->get('wallet_account'),
			'payment_method_id'          => $request->get('payment_method'),
			'currency'                   => $request->get('currency'),
			'min_amount'                 => $request->get('min_amount'),
			'max_amount'                 => $request->get('max_amount'),
			'profit_margin'              => $request->get('profit_margin'),
			'country'                    => strtoupper($request->get('country')),
			'privacy'                    => $request->get('privacy'),
			'require_phone_verification' => $request->get('require_phone_verification'),
			'require_email_verification' => $request->get('require_email_verification'),
			'confirmation_time_frame'    => $request->get('confirmation_time_frame'),
			'tags'                       => $request->get('tags'),
			'label'                      => $request->get('label'),
			'terms'                      => $request->get('terms'),
			'instructions'               => $request->get('instructions'),
		];
	}

	/**
	 * Create a sell offer
	 *
	 * @param Request $request
	 * @return \Illuminate\Database\Eloquent\Model
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function sell(Request $request)
	{
		$this->validateInput($request);
		$attributes = $this->getAttributes($request);
		$attributes['type'] = 'sell';

		if ($id = $request->id) {
			$offer = $this->getOffer($id);
			$offer->fill($attributes)->save();
			return $offer;
		} else {
			return Auth::user()->marketplaceOffers()
				->create($attributes);
		}
	}

	/**
	 * Validate input
	 *
	 * @param Request $request
	 * @throws \Illuminate\Validation\ValidationException
	 */
	public function validateInput(Request $request)
	{
		if (!Auth::user()->canInteract()) {
			abort(403, trans('auth.access_forbidden'));
		}

		$this->validate($request, [
			'wallet_account' => [
				'required',
				Rule::in(Auth::user()->walletAccounts()->get()->pluck('id')->toArray())
			],
			'currency'       => [
				'required',
				Rule::in($this->getCurrencies()->keys()->toArray())
			],
			'payment_method' => [
				'required',
				Rule::in($this->getPaymentMethods()->pluck('id')->toArray())
			],

			'tags'                    => 'required|array|max:3',
			'confirmation_time_frame' => 'required|numeric|min:30|max:4350',
			'label'                   => 'required|string|max:25',
			'country'                 => 'required|string|max:3',
			'terms'                   => 'required|string|max:1000',
			'instructions'            => 'required|string|max:1000',
			'profit_margin'           => 'required|numeric',
		]);


		if ($request->currency) {
			$minOfferAmount = currency(
				settings('marketplace')->min_offer_amount, 'USD', $request->currency
			);

			$maxOfferAmount = currency(
				settings('marketplace')->max_offer_amount, 'USD', $request->currency
			);

			$this->validate($request, [
				'min_amount' => "required|numeric|min:{$minOfferAmount}",
				'max_amount' => "nullable|numeric|max:{$maxOfferAmount}|gt:min_amount",
			]);
		}

	}

	/**
	 * Get offer
	 *
	 * @param $id
	 * @return MarketplaceOffer
	 */
	protected function getOffer($id)
	{
		$offer = MarketplaceOffer::findOrFail($id);

		if (!(
			Auth::user()->is($offer->walletAccount->user) ||
			Auth::user()->can('manage_marketplace')
		)) {
			abort(403, trans('auth.access_forbidden'));
		}

		return $offer;
	}

	/**
	 * Get payment methods
	 *
	 * @return PaymentMethod[]|\Illuminate\Database\Eloquent\Collection
	 */
	protected function getPaymentMethods()
	{
		return PaymentMethod::all();
	}

	/**
	 * Get currencies
	 *
	 * @return \Illuminate\Support\Collection
	 */
	protected function getCurrencies()
	{
		return collect(currency()->getCurrencies());
	}
}
