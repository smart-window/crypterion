<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Exceptions\TransferException;
use App\Models\WalletAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class WalletAccountController extends Controller
{
	/**
	 * @param Request $request
	 * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
	 */
	public function table(Request $request)
	{
		$walletAccounts = Auth::user()->walletAccounts();

		return paginateResult(
			$walletAccounts,
			$request->get('itemPerPage', 10),
			$request->get('page')
		);
	}

	/**
	 * Get a list of all wallet accounts
	 *
	 * @return \App\Models\WalletAccount[]
	 */
	public function list()
	{
		return Auth::user()->walletAccounts()->get();
	}

	/**
	 * Calculate fee based on amount
	 *
	 * @param Request $request
	 * @param $walletAccount
	 * @return \Illuminate\Http\JsonResponse
	 */
	public function calcFee(Request $request, $walletAccount)
	{
		$account = $this->getWalletAccount($walletAccount);
		$coin = $account->wallet->coin;

        $currency = Auth::user()->currency;
        $amount = coin($request->get('amount') ?: 0, $coin, true);
		$transactionFee = $account->calcTransactionFee($amount->getAmount());
		$withdrawalFee = $account->wallet->calcWithdrawalFee($amount->getAmount());
		$fee = coin($transactionFee + $withdrawalFee, $coin);

		return response()->json([
			'formatted_fee' => $fee->getFormattedPrice($currency),
			'fee'           => $fee->getValue(),
		]);
	}

	/**
	 * Send to wallet address
	 *
	 * @param Request $request
	 * @param $walletAccount
	 * @return \App\Models\TransferRecord
	 * @throws \Illuminate\Validation\ValidationException
	 * @throws \Throwable
	 */
	public function send(Request $request, $walletAccount)
	{
		$account = $this->getWalletAccount($walletAccount);

		$this->validate($request, [
			'amount' => [
				'bail', 'required', 'numeric',
				"min:{$account->min_transferable}",
				"max:{$account->max_transferable}",
			],

			'token' => [
				'nullable', 'required_without:password',
				function ($attribute, $value, $fail) use ($account) {
					if ($value !== null) {
						if (!$account->user->shouldVerifyTwoFactorForOutgoingTransfer()) {
							$fail(trans('auth.enter_password'));
						} else {
							if (!$account->user->verifyTwoFactorKey($value)) {
								$fail(trans('auth.invalid_token'));
							}
						}
					}
				},
			],

			'password' => [
				'nullable', 'required_without:token',
				function ($attribute, $value, $fail) use ($account) {
					if ($value !== null) {
						if ($account->user->shouldVerifyTwoFactorForOutgoingTransfer()) {
							$fail(trans('auth.enter_token'));
						} else {
							if (!Hash::check($value, $account->user->password)) {
								$fail(trans('auth.invalid_password'));
							}
						}
					}
				},
			],

			'address'     => ['required'],
			'description' => 'nullable|string|max:200'
		]);

		try {
			$transferRecord = $account->send(
				$request->get('amount'),
				$request->get('address')
			);
		} catch (TransferException $e) {
			$message = $e->getMessage();

			if ($e->getCode() == 422) {
				throw ValidationException::withMessages([
					'amount' => [$message],
				]);
			} else {
				throw ValidationException::withMessages([
					'address' => [$message],
				]);
			}
		}
		return $transferRecord;
	}

	/**
	 * @return \Illuminate\Http\JsonResponse
	 */
	public function totalAvailablePrice()
	{
		$price = Auth::user()->walletAccounts()
			->get()->sum('available_price');

		$formattedPrice = currency_format($price, Auth::user()->currency);

		return response()->json([
			'price'          => $price,
			'formattedPrice' => $formattedPrice
		]);
	}

	/**
	 * @param $walletAccount
	 * @return WalletAddress|\Illuminate\Database\Eloquent\Model|\Illuminate\Database\Eloquent\Relations\HasMany|object|null
	 */
	public function latestAddress($walletAccount)
	{
		return $this->getWalletAccount($walletAccount)->walletAddresses()->first();
	}

	/**
	 * @param $walletAccount
	 * @return \Illuminate\Http\JsonResponse
	 * @throws \Throwable
	 */
	public function generateAddress($walletAccount)
	{
		$account = $this->getWalletAccount($walletAccount);
		$lastAddress = $account->walletAddresses()
			->latest()->first();

		if ($lastAddress && $lastAddress->total_received <= 0) {
			abort(403, trans('wallet.last_address_not_used'));
		}

		return DB::transaction(function () use ($account) {
			$wallet = $account->wallet;
			$label = Auth::user()->walletAddressLabel();

			return $wallet->createAddress($account, $label);
		});
	}

	/**
	 * @param $id
	 * @return \App\Models\WalletAccount
	 */
	private function getWalletAccount($id)
	{
		return $account = Auth::user()->walletAccounts()->findOrFail($id);
	}
}
