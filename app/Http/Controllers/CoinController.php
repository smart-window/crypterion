<?php

namespace App\Http\Controllers;

use App\Adapters\Coin\Resources\PendingApproval;
use App\Adapters\Coin\Resources\Transaction;
use App\Models\Coin;
use Illuminate\Http\Request;

class CoinController extends Controller
{
    /**
     * Handle transaction webhook for coin
     *
     * @param Request $request
     * @param $identifier
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Illuminate\Http\Response|void
     * @throws \Exception
     */
    public function handleTransactionWebhook(Request $request, $identifier)
    {
        if ($coin = $this->getCoin($identifier)) {
            $resource = $coin->adapter->handleTransactionWebhook(
                $coin->wallet->getAdapterResource(), $request->all()
            );

            if ($resource instanceof Transaction) {
                return $coin->saveTransactionResource($resource);
            }
        }
    }

    /**
     * Handle pending approval webhook for coin
     *
     * @param Request $request
     * @param $identifier
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Illuminate\Http\Response|void
     * @throws \Exception
     */
    public function handlePendingApprovalWebhook(Request $request, $identifier)
    {
        if ($coin = $this->getCoin($identifier)) {
            $resource = $coin->adapter->handlePendingApprovalWebhook(
                $coin->wallet->getAdapterResource(), $request->all()
            );

            if ($resource instanceof PendingApproval) {
                return $coin->savePendingApprovalResource($resource);
            }
        }
    }

    /**
     * Get coin model
     *
     * @param $identifier
     * @return Coin
     */
    protected function getCoin($identifier)
    {
        return Coin::where('identifier', $identifier)->first();
    }
}
