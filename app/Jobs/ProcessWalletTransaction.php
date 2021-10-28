<?php

namespace App\Jobs;

use App\Adapters\Coin\Resources\Transaction;
use App\Models\Coin;
use App\Models\TransferRecord;
use App\Models\WalletAddress;
use App\Models\WalletTransaction;
use App\Notifications\Wallet\ConfirmedReceive;
use App\Notifications\Wallet\UnconfirmedReceive;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProcessWalletTransaction implements ShouldQueue
{
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	/**
	 * @var Transaction
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
	 * @var WalletTransaction
	 */
	protected $transaction;

	/**
	 * Create a new job instance.
	 *
	 * @param Coin $coin
	 * @param Transaction $resource
	 * @param $lockOwner
	 */
	public function __construct(Transaction $resource, Coin $coin, $lockOwner)
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
	 * @throws \Throwable
	 */
	public function handle()
	{
		DB::transaction(function () {
			if ($this->resource->getType() === "send") {
				$this->handleOutgoingTransaction();
			}

			if ($this->resource->getType() === "receive") {
				$this->handleIncomingTransaction();
			}
		});
		$this->cleanUp();
	}

	/**
	 * @throws \Exception
	 */
	protected function handleOutgoingTransaction()
	{
		$transaction = $this->coin->wallet->transactions()
			->where('hash', $this->resource->getHash())
			->where('type', $this->resource->getType())->first();

		if (!$transaction) return;

		$transaction->transferRecords()->update([
			'confirmations' => $this->resource->getConfirmations(),
		]);

		$transaction->update([
			'input'         => $this->resource->getInput(),
			'output'        => $this->resource->getOutput(),
			'confirmations' => $this->resource->getConfirmations(),
			'data'          => $this->resource->getData(),
		]);
	}

	/**
	 * @throws \Exception
	 * @throws \Throwable
	 */
	protected function handleIncomingTransaction()
	{
		$output = $this->resource->getOutput();

		if (is_array($output)) {
			collect($output)->each(function ($output) {
				$address = $this->coin->wallet
					->addresses()->where('address', $output['address'])
					->first();

				if ($address) {
					$this->saveTransferRecord($address, $output['value']);
				}
			});
		}

		if (is_string($output)) {
			$address = $this->coin->wallet
				->addresses()->where('address', $output)
				->first();

			if ($address) {
				$this->saveTransferRecord($address);
			}
		}
	}

	/**
	 * @return \App\Models\WalletTransaction
	 * @throws \Exception
	 */
	protected function saveTransaction()
	{
		if (!isset($this->transaction)) {
			$this->transaction = $this->coin->wallet->transactions()->updateOrCreate([
				'hash' => $this->resource->getHash(),
				'type' => $this->resource->getType(),
			], [
				'date'          => $this->resource->getDate(),
				'source_id'     => $this->resource->getId(),
				'confirmations' => $this->resource->getConfirmations(),
				'value'         => abs($this->resource->getValue()),
				'input'         => $this->resource->getInput(),
				'output'        => $this->resource->getOutput(),
				'data'          => $this->resource->getData(),
			]);
		}
		return $this->transaction;
	}

	/**
	 * @param WalletAddress $address
	 * @param integer $value
	 * @return TransferRecord
	 * @throws \Exception
	 * @throws \Throwable
	 */
	protected function saveTransferRecord($address, $value = null)
	{
		$transaction = $this->saveTransaction();

		$transferRecord = $address->transferRecords()->updateOrCreate([
			'wallet_transaction_id' => $transaction->id,
		], [
			'dollar_price'           => $this->coin->getDollarPrice(),
			'required_confirmations' => $this->coin->wallet->min_confirmations,
			'value'                  => abs($value ?: $transaction->value),
			'wallet_account_id'      => $address->walletAccount->id,
            'description'            => $this->getExtReceiveDesc(null, $address->address),
			'type'                   => $transaction->type,
			'confirmations'          => $transaction->confirmations,
		]);

		$user = $address->walletAccount->user;

		switch ($transferRecord->confirmations) {
			case 0:
				$user->notify(new UnconfirmedReceive($transferRecord));
				break;
			case $transferRecord->required_confirmations:
				$user->notify(new ConfirmedReceive($transferRecord));
				break;
		}

		return $transferRecord;
	}

    /**
     * Get external receive description
     *
     * @param $desc
     * @param $address
     * @return mixed|string|null
     */
    protected function getExtReceiveDesc($desc, $address)
    {
        $text = trans('wallet.external_receive_desc', ['address' => $address]);
        return is_string($desc) ? $text . " - " . $desc : $text;
    }

	/**
	 * Remove the resource then release lock
	 *
	 * @throws \Exception
	 */
	protected function cleanUp()
	{
		$this->coin->removeTransactionResource($this->resource->getHash());
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
