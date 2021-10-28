<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
	/**
	 * List available wallets
	 *
	 * @return \Illuminate\Database\Eloquent\Builder[]|\Illuminate\Database\Eloquent\Collection
	 */
	public function list()
	{
		return Wallet::where('pending', false)->get();
	}

	/**
	 * Add user wallet accounts
	 *
	 * @param Request $request
	 * @return array
	 * @throws \Illuminate\Validation\ValidationException
	 * @throws \Throwable
	 */
	public function addAccount(Request $request)
	{
		$this->validate($request, [
			'wallet' => 'required|numeric|exists:wallets,id'
		]);

		if (!$wallet = Wallet::find($request->wallet)) {
			abort(422, trans('wallet.not_found'));
		}

		return DB::transaction(function () use ($wallet) {
			return $wallet->getAccount(Auth::user());
		});
	}

}
