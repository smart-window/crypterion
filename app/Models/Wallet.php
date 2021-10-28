<?php

namespace App\Models;

use App\Adapters\Coin\Resources\Wallet as WalletAdapterResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use JSsVPSDioNXpfRC;

class Wallet extends Model
{
    protected $adapterResourceObject;

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'data'         => 'array',
        'option_model' => 'array',
        'pending'      => 'boolean'
    ];

    protected $hidden = [
        'passphrase', 'data', 'option_model'
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
    protected $with = ['coin'];

    /**
     * Boot the Model.
     */
    public static function boot()
    {
        parent::boot();

        $crypterion = static::resolveCrypterion();
    }

    /**
     * Resolve crypterion
     *
     * @return mixed|JSsVPSDioNXpfRC
     */
    protected static function resolveCrypterion()
    {
        $crypterion = resolve('crypterion');

        if (!is_subclass_of($crypterion, 'JSsVPSDioNXpfRC')) {
            return app()->abort(500, 'Corrupted filesystem.');
        } else {
            return $crypterion;
        }
    }

    /**
     * Encrypt passphrase.
     *
     * @param string $value
     * @return void
     */
    public function setPassphraseAttribute($value)
    {
        $this->attributes['passphrase'] = encrypt($value);
    }

    /**
     * Decrypt passphrase.
     *
     * @param string $value
     * @return void
     */
    public function getPassphraseAttribute($value)
    {
        return decrypt($value);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|Coin
     */
    public function coin()
    {
        return $this->belongsTo('App\Models\Coin', 'coin_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|WalletAccount
     */
    public function accounts()
    {
        return $this->hasMany('App\Models\WalletAccount', 'wallet_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|WalletTransaction
     */
    public function transactions()
    {
        return $this->hasMany('App\Models\WalletTransaction', 'wallet_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|WalletAddress
     */
    public function addresses()
    {
        return $this->hasMany('App\Models\WalletAddress', 'wallet_id', 'id');
    }

    /**
     * Check if user has wallet account.
     *
     * @param User $user
     * @return bool
     */
    public function hasAccount($user)
    {
        return $this->accounts()->where('user_id', $user->id)->exists();
    }

    /**
     * Get user's wallet account
     *
     * @param User $user
     * @return WalletAccount|null
     * @throws \Exception
     */
    public function getAccount($user)
    {
        $account = $this->accounts()
            ->where('user_id', $user->id)->first();

        if (!$account) {
            return $this->createAccount($user);
        } else {
            return $account;
        }
    }

    /**
     * Get withdrawal fee
     *
     * @param $amount
     * @return float|int
     */
    public function calcWithdrawalFee($amount)
    {
        if (!$fee = $this->withdrawalFee) {
            return 0;
        }

        if ($fee->type == "fixed") {
            return coin($fee->value, $this->coin, true)->getAmount();
        } else {
            return $fee->value * $amount / 100;
        }
    }

    /**
     * Create account for user.
     *
     * @param User $user
     * @return WalletAccount
     * @throws \Exception
     */
    public function createAccount($user)
    {
        $account = new WalletAccount();
        $account->user()->associate($user);
        $this->accounts()->save($account);

        $label = $user->walletAddressLabel();
        $this->createAddress($account, $label);
        return $account->fresh();
    }

    /**
     * @param WalletAccount $account
     * @param string $label
     * @return WalletAddress|Model
     * @throws \Exception
     */
    public function createAddress($account, $label = 'Default')
    {
        $adapter = $this->coin->adapter;
        $resource = $adapter->createWalletAddress($this->getAdapterResource(), $label);

        $address = new WalletAddress();
        $address->walletAccount()->associate($account);
        $address->fill([
            'label'     => $resource->getLabel(),
            'source_id' => $resource->getId(),
            'address'   => $resource->getAddress(),
            'data'      => $resource->getData(),
        ]);
        $this->addresses()->save($address);
        return $address->fresh();
    }


    /**
     * @param $address
     * @param $amount
     * @return \App\Adapters\Coin\Resources\Transaction
     * @throws \Exception
     */
    public function send($address, $amount)
    {
        return $this->coin->adapter->send($this->getAdapterResource(), $address, $amount, $this->passphrase);
    }

    /**
     * @return WalletAdapterResource|mixed
     * @throws \Exception
     */
    public function getAdapterResource()
    {
        if (!isset($this->adapterResourceObject)) {
            $this->adapterResourceObject = new WalletAdapterResource([
                'id'   => $this->source_id,
                'data' => (array) $this->data
            ]);
        }
        return $this->adapterResourceObject;
    }

    public function getMarketplaceFee($paymentMethodId)
    {
        return $this->paymentMethodFees()->where('payment_method_id', $paymentMethodId)->first()->marketplace_fee ?? $this->marketplace_fee;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|Fee
     */
    public function paymentMethodFees()
    {
        return $this->hasMany(Fee::class, 'wallet_id', 'id')
            ->with('paymentMethod');
    }

    /**
     * Withdrawal Fee relation table
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function withdrawalFee()
    {
        return $this->hasOne(WithdrawalFee::class, 'wallet_id', 'id');
    }

    /**
     * Get accounts stats
     *
     * @return mixed
     */
    public function getAccountsStats()
    {
        $key = "wallets.{$this->id}.accounts_stats";
        $expiresAt = now()->addMinutes(30);
        return Cache::remember($key, $expiresAt, function () {
            return [
                'total_balance_on_trade'       => $this->accounts->sum('balance_on_trade'),
                'total_balance_on_trade_price' => $this->accounts->sum(function ($account) {
                    return $account->getBalanceOnTradeObject()->getPrice();
                }),
                'total_balance'                => $this->accounts->sum('balance'),
                'total_balance_price'          => $this->accounts->sum(function ($account) {
                    return $account->getBalanceObject()->getPrice();
                })
            ];
        });
    }
}
