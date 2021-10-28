<?php

namespace App\Jobs;

use App\Adapters\Coin\Resources\PendingApproval;
use App\Adapters\Coin\Resources\Transaction;
use App\Models\PendingApproval as PendingApprovalModel;
use App\Models\Coin;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Cache;

class ProcessPendingApproval implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;


    /**
     * @var PendingApproval
     */
    protected $resource;

    /**
     * @var Coin
     */
    protected $coin;

    /**
     * @var mixed
     */
    protected $lockOwner;

    /**
     * Create a new job instance.
     *
     * @param Coin $coin
     * @param PendingApproval $resource
     * @param $lockOwner
     */
    public function __construct(PendingApproval $resource, Coin $coin, $lockOwner)
    {
        $this->resource = $resource;
        $this->coin = $coin;
        $this->lockOwner = $lockOwner;
    }

    /**
     * Execute the job.
     *
     * @return void
     * @throws \Exception
     */
    public function handle()
    {
        $pendingApproval = PendingApprovalModel::has('transferRecord')
            ->where('source_id', $this->resource->getId())->first();

        if ($pendingApproval) {
            $pendingApproval->update([
                'state' => $this->resource->getState(),
                'info'  => $this->resource->getInfo(),
                'scope' => $this->resource->getScope(),
                'data'  => $this->resource->getData(),
            ]);

            if (in_array($pendingApproval->state, ['approved'])) {
                $info = collect($pendingApproval->info['transactionRequest']);
                $hash = $info->get('validTransactionHash');

                $transactionResource = $this->coin->adapter->getWalletTransaction(
                    $this->coin->wallet->getAdapterResource(), $hash
                );

                $transaction = $this->coin->wallet->transactions()->updateOrCreate([
                    'hash' => $transactionResource->getHash(),
                ], [
                    'type'          => $transactionResource->getType(),
                    'source_id'     => $transactionResource->getId(),
                    'value'         => $transactionResource->getValue(),
                    'date'          => $transactionResource->getDate(),
                    'confirmations' => $transactionResource->getConfirmations(),
                    'input'         => $transactionResource->getInput(),
                    'output'        => $transactionResource->getOutput(),
                    'data'          => $transactionResource->getData(),
                ]);

                $pendingApproval->transferRecord->update([
                    'confirmations'         => $transaction->confirmations,
                    'wallet_transaction_id' => $transaction->id,
                ]);
            }
        }

        $this->cleanUp();
    }


    /**
     * Remove the resource then release lock
     *
     * @throws \Exception
     */
    protected function cleanUp()
    {
        $this->coin->removePendingApprovalResource($this->resource->getId());
        $this->releaseLock();
    }

    /**
     * Release lock on the resource
     *
     * @throws \Exception
     */
    public function releaseLock()
    {
        Cache::restoreLock($this->resource->lockKey(), $this->lockOwner)->release();
    }

    /**
     * The job failed to process.
     *
     * @param \Exception $exception
     * @return void
     * @throws \Exception
     */
    public function failed($exception)
    {
        $this->releaseLock();
    }
}
