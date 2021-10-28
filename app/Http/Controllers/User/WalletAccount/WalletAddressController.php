<?php

namespace App\Http\Controllers\User\WalletAccount;

use App\Http\Controllers\Controller;
use App\Models\WalletAccount;
use App\Models\WalletAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WalletAddressController extends Controller
{
	/**
	 * @param Request $request
	 * @param $walletAccount
	 * @return mixed
	 */
	public function table(Request $request, $walletAccount)
	{
		$walletAddresses = $this->getWalletAccount($walletAccount)
			->walletAddresses()->latest();

		$filters = $request->get('filters', []);

		return paginateResult(
			$walletAddresses,
			$request->get('itemPerPage', 10),
			$request->get('page'),
			array_only($filters, ['address', 'label'])
		);
	}

	/**
	 * Reset Address Webhook
	 *
	 * @param WalletAccount $walletAccount
	 * @param WalletAddress $walletAddress
	 */
	public function resetWebhook(WalletAccount $walletAccount, WalletAddress $walletAddress)
	{
		if (!$walletAccount->user->is(Auth::user())) {
			abort(404, trans('wallet.account_not_found'));
		}

		if (!$walletAddress->walletAccount->is($walletAccount)){
			abort(404, trans('wallet.address_not_found'));
		}

		$walletAccount->wallet->coin->adapter
			->setWalletAddressTransactionWebhooks($walletAddress->address);
	}

	/**
	 * @param $id
	 * @return \App\Models\WalletAccount|void|null
	 */
	private function getWalletAccount($id)
	{
		return $account = Auth::user()->walletAccounts()->find($id) ??
			abort(404, trans('wallet.account_not_found'));
	}
}
