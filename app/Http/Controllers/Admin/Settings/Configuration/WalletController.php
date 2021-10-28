<?php

namespace App\Http\Controllers\Admin\Settings\Configuration;

use App\Models\Coin;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class WalletController extends Controller
{
    /**
     * Get wallet data
     *
     * @return Wallet[]
     */
    public function data()
    {
        return Wallet::with('withdrawalFee')->get();
    }

    /**
     * Update wallet data
     *
     * @param Request $request
     * @throws \Illuminate\Validation\ValidationException
     */
    public function update(Request $request)
    {
        $this->validate($request, [
            '*.type'  => 'required|in:fixed,percent',
            '*.value' => 'required|numeric|min:0',
        ]);

        foreach ($request->all() as $identifier => $fee) {
            $wallet = Wallet::select()
                ->whereHas('coin', function ($query) use ($identifier) {
                    $query->where('identifier', $identifier);
                })->firstOrFail();

            $wallet->withdrawalFee()->updateOrCreate([
                'wallet_id' => $wallet->id
            ], [
                'type'  => $fee['type'],
                'value' => $fee['value']
            ]);
        }
    }
}
