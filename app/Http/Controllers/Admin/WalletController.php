<?php

namespace App\Http\Controllers\Admin;

use App\Adapters\Coin\CoinAdapter;
use App\Adapters\Coin\Resources\Transaction;
use App\Helpers\CoinManager;
use App\Http\Controllers\Controller;
use App\Models\Coin;
use App\Models\MarketplaceCharge;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class WalletController extends Controller
{
    /**
     * Get wallet data
     *
     * @return array
     */
    public function data()
    {
        $currency = Auth::user()->currency;
        $totalEarnings = $this->calcTotalEarnings($currency);
        $wallets = $this->getWallets();
        $totalAccountBalanceOnTrade = $this->calcTotalAccountBalanceOnTrade($wallets, $currency);
        $totalAccountBalance = $this->calcTotalAccountBalance($wallets, $currency);

        return [
            'total_earnings'                           => $totalEarnings,
            'formatted_total_earnings'                 => currency_format($totalEarnings, $currency),
            'total_account_balance_on_trade'           => $totalAccountBalanceOnTrade,
            'formatted_total_account_balance_on_trade' => currency_format($totalAccountBalanceOnTrade, $currency),
            'total_account_balance'                    => $totalAccountBalance,
            'formatted_total_account_balance'          => currency_format($totalAccountBalance, $currency),
            'wallets'                                  => $wallets,
            'adapters'                                 => $this->getAdapters(),
            'currency'                                 => $currency
        ];
    }

    /**
     * Calculate total balance
     *
     * @param Collection $wallets
     * @param string $currency
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    protected function calcTotalAccountBalance($wallets, $currency)
    {
        $amount = $wallets->sum(function ($wallet) {
            return $wallet['accounts_stats']['total_balance_price'];
        });

        return currency($amount, 'USD', $currency);
    }


    /**
     * Calculate grand total balance
     *
     * @param Collection $wallets
     * @param string $currency
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    protected function calcTotalAccountBalanceOnTrade($wallets, $currency)
    {
        $amount = $wallets->sum(function ($wallet) {
            return $wallet['accounts_stats']['total_balance_on_trade_price'];
        });

        return currency($amount, 'USD', $currency);
    }

    /**
     * Get wallets data
     *
     * @return \Illuminate\Support\Collection
     */
    protected function getWallets()
    {
        return Wallet::latest()
            ->withCount('accounts')->get()
            ->map(function (Wallet $wallet) {
                return $this->prepareWallet($wallet);
            });
    }

    /**
     * Prepare wallet object
     *
     * @param Wallet $wallet
     * @return array
     */
    protected function prepareWallet($wallet)
    {
        return [
            'name'              => $wallet->coin->name,
            'source_id'         => $wallet->source_id,
            'identifier'        => $wallet->coin->identifier,
            'base_unit'         => $wallet->coin->base_unit,
            'precision'         => $wallet->coin->precision,
            'symbol'            => $wallet->coin->symbol,
            'min_confirmations' => $wallet->min_confirmations,
            'accounts_count'    => $wallet->accounts_count,
            'accounts_stats'    => $wallet->getAccountsStats(),
        ];
    }

    /**
     * Calculate total earnings.
     *
     * @param $currency
     * @return float|double|int
     */
    protected function calcTotalEarnings($currency)
    {
        $totalDollarAmount = MarketplaceCharge::sum('dollar_amount');

        return currency($totalDollarAmount, 'USD', $currency);
    }

    /**
     * Validate adapter
     *
     * @param Request $request
     * @return array
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function validateWallet(Request $request)
    {
        $adapters = $this->getAdapters()->pluck('class');

        return $this->validate($request, [
            'min_confirmations' => 'required|numeric|min:1|max:6',
            'adapter'           => [
                'required', Rule::in($adapters->toArray())
            ],
        ]);
    }

    /**
     * Validate wallet request
     *
     * @param Request $request
     * @return array
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     * @throws \Throwable
     */
    protected function add(Request $request)
    {
        $this->validateWallet($request);
        $confirmations = $request->get('min_confirmations');
        $className = $request->get('adapter');

        $adapter = new $className();

        $wallet = DB::transaction(function () use ($adapter, $confirmations) {
            return CoinManager::registerCoin($adapter)
                ->createWallet($confirmations);
        });

        return $this->prepareWallet($wallet);
    }

    /**
     * Remove wallet
     *
     * @param Request $request
     * @param $identifier
     * @throws \Exception
     */
    protected function remove($identifier)
    {
        Coin::whereDoesntHave('wallet.accounts')
            ->where('identifier', $identifier)->delete();
    }

    /**
     * Reset webhook
     *
     * @param $identifier
     */
    protected function resetWebhook($identifier)
    {
        $coin = Coin::whereHas('wallet')->where('identifier', $identifier)->firstOrFail();
        $resource = $coin->wallet->getAdapterResource();
        $coin->adapter->unsetPendingApprovalWebhook($resource);
        $coin->adapter->unsetTransactionWebhook($resource);
        $coin->adapter->setTransactionWebhook($resource, $coin->wallet->min_confirmations);
        $coin->adapter->setPendingApprovalWebhook($resource);
    }

    /**
     * Relay Transaction
     *
     * @param Request $request
     * @param $identifier
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function relayTransaction(Request $request, $identifier)
    {
        $this->validate($request, ['hash' => 'required']);
        $hash = $request->get('hash');

        $coin = Coin::whereHas('wallet')->where('identifier', $identifier)->firstOrFail();

        $wallet = $coin->wallet()->first();

        $resource = $coin->adapter->getWalletTransaction($wallet->getAdapterResource(), $hash);

        if ($resource instanceof Transaction) {
            return $coin->saveTransactionResource($resource);
        }
    }

    /**
     * Get adapters
     *
     * @return Collection
     */
    protected function getAdapters()
    {
        $coins = Coin::all();

        return collect($this->adapters())
            ->map(function ($className) use ($coins) {
                if (!class_exists($className)) {
                    return null;
                }
                try {
                    $adapter = new $className();

                    if ($adapter instanceof CoinAdapter) {
                        $identifier = $adapter->getIdentifier();

                        if ($coins->contains('identifier', $identifier)) {
                            return null;
                        }

                        return [
                            'class'      => $className,
                            'name'       => $adapter->getName(),
                            'identifier' => $identifier,
                            'symbol'     => $adapter->getSymbol(),
                        ];
                    }
                } catch (\Exception $e) {
                    return null;
                }
                return null;
            })->filter()->values();
    }

    /**
     * Available Coin Adapters
     *
     * @return array
     */
    protected function adapters()
    {
        return resolve('CoinAdapters')->all();
    }
}
