<?php

namespace App\Models;

use App\Events\TransferRecordSaved;
use App\Helpers\CoinFormatter;
use Illuminate\Database\Eloquent\Model;


class TransferRecord extends Model
{
    protected $balanceAttribute;
    protected $balanceObject;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'saved' => TransferRecordSaved::class,
    ];

    protected $appends = [
        'value_price',
        'hash',
        'formatted_value_price',
        'coin',
        'confirmed',
        'balance',
        'balance_price',
        'formatted_balance_price',
    ];

    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = [
        'walletAccount',
    ];

    /**
     * The "boot" method of the model.
     *
     * Record balance of user after each
     * record change.
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($transferRecord) {
            $account = $transferRecord->walletAccount->fresh();

            $transferRecord->update([
                'balance' => $account->getBalance(),
            ]);
        });
    }

    /**
     * @return bool
     */
    public function getConfirmedAttribute()
    {
        return $this->confirmations >= $this->required_confirmations;
    }

    /**
     * @return mixed|string
     */
    public function getCoinAttribute()
    {
        return $this->walletAccount->wallet->coin->name;
    }

    /**
     * @param $value
     */
    public function setValueAttribute($value)
    {
        if ($value instanceof CoinFormatter) {
            $this->attributes['value'] = $value->getAmount();
        } else {
            $this->attributes['value'] = (float) $value;
        }
    }

    /**
     * @return CoinFormatter|mixed
     */
    public function getValueObject()
    {
        return coin($this->getOriginal('value'), $this->walletAccount->wallet->coin);
    }

    /**
     * Get value converted from base unit
     *
     * @param $value
     * @return float
     */
    public function getValueAttribute()
    {
        return $this->getValueObject()->getValue();
    }

    /**
     * Get the price of the value
     *
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getValuePriceAttribute()
    {
        return $this->getValueObject()->getPrice($this->walletAccount->user->currency, $this->dollar_price);
    }

    /**
     * Get formatted price of the value
     *
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedValuePriceAttribute()
    {
        return $this->getValueObject()->getFormattedPrice($this->walletAccount->user->currency, $this->dollar_price);
    }

    /**
     * @return \App\Helpers\CoinFormatter|mixed
     */
    public function getBalanceObject()
    {
        if (!isset($this->balanceObject)) {
            $this->balanceObject = coin($this->getOriginal('balance'), $this->walletAccount->wallet->coin);
        }
        return $this->balanceObject;
    }

    /**
     * @return float
     */
    public function getBalanceAttribute()
    {
        return $this->getBalanceObject()->getValue();
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getBalancePriceAttribute()
    {
        return $this->getBalanceObject()->getPrice($this->walletAccount->user->currency);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedBalancePriceAttribute()
    {
        return $this->getBalanceObject()->getFormattedPrice($this->walletAccount->user->currency, $this->dollar_price);
    }

    /**
     * Get transaction hash
     *
     * @return mixed
     */
    public function getHashAttribute()
    {
        return $this->walletTransaction()->value('hash');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|WalletAddress
     */
    public function receiverWalletAddress()
    {
        return $this->belongsTo('App\Models\WalletAddress', 'receiver_wallet_address_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|WalletTransaction
     */
    public function walletTransaction()
    {
        return $this->belongsTo('App\Models\WalletTransaction', 'wallet_transaction_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function pendingApproval()
    {
        return $this->hasOne(PendingApproval::class, 'transfer_record_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|WalletAccount
     */
    public function walletAccount()
    {
        return $this->belongsTo('App\Models\WalletAccount', 'wallet_account_id', 'id');
    }
}
