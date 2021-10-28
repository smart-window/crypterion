<?php

namespace App\Models;

use App\Helpers\CoinFormatter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class PendingApproval extends Model
{
    protected $hidden = [
        'data'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'data' => 'array',
        'info' => 'array',
    ];

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];


    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = [
        'transferRecord',
    ];

    protected $appends = [
        'total_amount',
        'total_amount_price',
        'addresses',
    ];

    /**
     * Get transaction request
     *
     * @return mixed|Collection
     */
    protected function getTransactionRecipients()
    {
        if (!$request = Arr::get($this->info, 'transactionRequest')) {
            abort("Missing Transaction Request");
        }

        if(!$recipients = Arr::get($request, 'recipients')){
            abort("Unknown Transaction Request");
        }
        return collect($recipients);
    }

    /**
     * @return CoinFormatter|mixed
     */
    public function getTotalAmountObject()
    {
        $recipients = $this->getTransactionRecipients();
        return coin($recipients->sum('amount'), $this->transferRecord->walletAccount->wallet->coin);
    }

    /**
     * Get amount converted from base unit
     *
     * @param $value
     * @return float
     */
    public function getTotalAmountAttribute()
    {
        return $this->getTotalAmountObject()->getValue();
    }


    /**
     * Get the price of the amount
     *
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getTotalAmountPriceAttribute()
    {
        return $this->getTotalAmountObject()
            ->getPrice($this->transferRecord->walletAccount->user->currency);
    }

    /**
     * Get addresses involved
     *
     * @return Collection
     */
    public function getAddressesAttribute()
    {
        return $this->getTransactionRecipients()->pluck('address');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|Wallet
     */
    public function transferRecord()
    {
        return $this->belongsTo(TransferRecord::class, 'transfer_record_id', 'id');
    }
}
