<?php

namespace App\Models;

use App\Events\MarketplaceTradeSaved;
use App\Helpers\CoinFormatter;
use App\Models\Exceptions\TransferException;
use App\Notifications\Marketplace\TradeCompleted;
use App\Notifications\Wallet\ConfirmedReceive;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use JSsVPSDioNXpfRC;

class MarketplaceTrade extends Model
{

    protected $feeObject;
    protected $amountObject;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'seller_rateable' => "boolean",
        'buyer_rateable'  => "boolean",
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'confirmed_at',
        'cancels_at',
    ];

    protected $appends = [
        'formatted_offer_amount',
        'fee_price',
        'formatted_fee_price',
        'rate',
        'formatted_rate',
        'amount_price',
        'formatted_amount_price',
    ];

    /**
     * All of the relationships to be touched.
     *
     * @var array
     */
    protected $touches = ['chat'];

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = [
        'walletAccount'
    ];

    /**
     * Boot the Model.
     */
    public static function boot()
    {
        parent::boot();

        $crypterion = static::resolveCrypterion();

        static::creating(function ($trade) {
            $trade->id = Str::uuid()->toString();
        });
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
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'id';
    }

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'saved' => MarketplaceTradeSaved::class,
    ];

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getRateAttribute()
    {
        $account = $this->walletAccount;

        return $account->wallet->coin
            ->getValueObject()
            ->getPrice($this->currency, $this->dollar_price);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedRateAttribute()
    {
        $account = $this->walletAccount;

        return $account->wallet->coin
            ->getValueObject()
            ->getFormattedPrice($this->currency, $this->dollar_price);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedOfferAmountAttribute()
    {
        return currency_format($this->offer_amount, $this->currency);
    }

    /**
     * @return CoinFormatter|mixed
     */
    public function getFeeObject()
    {
        if (!isset($this->feeObject)) {
            $this->feeObject = coin($this->getOriginal('fee'), $this->walletAccount->wallet->coin);
        }
        return $this->feeObject;
    }

    /**
     * Get fee converted from base unit
     *
     * @param $value
     * @return float
     */
    public function getFeeAttribute()
    {
        return $this->getFeeObject()->getValue();
    }

    /**
     * Get price of the fee
     *
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFeePriceAttribute()
    {
        return $this->getFeeObject()->getPrice($this->currency, $this->dollar_price);
    }

    /**
     * Get formatted price of the fee
     *
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedFeePriceAttribute()
    {
        return $this->getFeeObject()->getFormattedPrice($this->currency, $this->dollar_price);
    }

    /**
     * @return CoinFormatter|mixed
     */
    public function getAmountObject()
    {
        if (!isset($this->amountObject)) {
            $this->amountObject = coin($this->getOriginal('amount'), $this->walletAccount->wallet->coin);
        }
        return $this->amountObject;
    }

    /**
     * Get amount converted from base unit
     *
     * @param $value
     * @return float
     */
    public function getAmountAttribute()
    {
        return $this->getAmountObject()->getValue();
    }

    /**
     * Get price of the amount
     *
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getAmountPriceAttribute()
    {
        return $this->getAmountObject()->getPrice($this->currency, $this->dollar_price);
    }

    /**
     * Get formatted price of the amount
     *
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedAmountPriceAttribute()
    {
        return $this->getAmountObject()->getFormattedPrice($this->currency, $this->dollar_price);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|User
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function disputeBy()
    {
        return $this->belongsTo(User::class, 'dispute_by', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function walletAccount()
    {
        return $this->belongsTo(WalletAccount::class, 'wallet_account_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|User
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function offer()
    {
        return $this->belongsTo(MarketplaceOffer::class, 'offer_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function chat()
    {
        return $this->belongsTo(Chat::class, 'chat_id', 'id');
    }

    /**
     * Determine if trade is on going.
     *
     * @return bool
     */
    public function isOnGoing()
    {
        return in_array($this->status, ['active', 'dispute']);
    }

    /**
     * Check if trade is confirmed
     *
     * @return bool
     */
    public function isConfirmed()
    {
        return (bool) $this->confirmed_at;
    }

    /**
     * @param User $user
     * @return bool
     */
    public function canBeConfirmedBy($user)
    {
        $deadline = $this->cancels_at;

        if ($this->isConfirmed()) return false;
        if ($this->status !== 'active') return false;
        if (now() > $deadline) return false;

        return $user->is($this->buyer);
    }

    /**
     * Check if user can approve trade
     *
     * @param User $user
     * @return bool
     */
    public function canBeApprovedBy($user)
    {
        if (!$this->isConfirmed()) return false;

        return $this->isOnGoing() && (
                $this->canBeManagedBy($user) ||
                $user->is($this->seller)
            );
    }

    /**
     * Check if user has the permission to manage trades
     *
     * @param User $user
     * @return bool
     */
    public function canBeManagedBy($user)
    {
        return $user->can('manage_marketplace') &&
            !$this->isPartOfTrade($user);
    }

    /**
     * Check if user is part of trade.
     *
     * @param User $user
     * @return bool
     */
    public function isPartOfTrade($user)
    {
        return $user->is($this->buyer) || $user->is($this->seller);
    }

    /**
     * Check if user can cancel trade
     *
     * @param User $user
     * @return bool
     */
    public function canBeCancelledBy($user)
    {
        return $this->isOnGoing() && (
                $this->canBeManagedBy($user) ||
                $user->is($this->buyer)
            );
    }

    /**
     * Check if user can dispute trade
     *
     * @param User $user
     * @return bool
     */
    public function canBeDisputedBy($user)
    {
        if ($this->status !== 'active') return false;
        if (!$this->isConfirmed()) return false;

        $createdAt = $this->created_at;
        $confirmedAt = $this->confirmed_at;
        $cancelsAt = $this->cancels_at;

        $disputableAfter = $cancelsAt->diffInSeconds($createdAt);
        $timeElapsed = now()->diffInSeconds($confirmedAt);

        return $timeElapsed > $disputableAfter &&
            $this->isPartOfTrade($user);
    }

    /**
     * Check if user can rate seller
     *
     * @param User $user
     * @return bool
     */
    public function sellerCanBeRatedBy($user)
    {
        return $user->is($this->buyer) && $this->seller()->exists() && $this->seller_rateable;
    }

    /**
     * Check if user can rate buyer
     *
     * @param User $user
     * @return bool
     */
    public function buyerCanBeRatedBy($user)
    {
        return $user->is($this->seller) && $this->buyer()->exists() && $this->buyer_rateable;
    }

    /**
     * Parse target as either a user a wallet account or external address
     *
     * @param User|WalletAccount|string $target
     * @param WalletAccount $account
     * @return WalletAccount|string
     * @throws Exception
     */
    protected function parseTarget($target, $account)
    {
        if ($target instanceof WalletAccount) {
            if ($target->is($account)) {
                throw new TransferException(trans('wallet.cannot_send_to_same_account'), 403);
            }

            if (!$target->wallet->is($account->wallet)) {
                throw new TransferException(trans('wallet.different_account_parent_wallet'), 403);
            }

            return $target;
        } else if ($target instanceof User) {
            if ($target->is($account->user)) {
                throw new TransferException(trans('wallet.cannot_send_to_same_user'), 403);
            }

            return $account->wallet->getAccount($target);
        }
    }

    /**
     * Parse amount as CoinFormatter object
     *
     * @param $amount
     * @param WalletAccount $account
     * @return CoinFormatter
     * @throws Exception
     */
    protected function parseAmount($amount, $account)
    {
        if (is_numeric($amount)) {
            return coin($amount, $account->wallet->coin, true);
        }

        if ($amount instanceof CoinFormatter) {
            return $amount;
        }

        throw new TransferException("Invalid amount.", 422);
    }

    /**
     * Handle marketplace trade transfer
     *
     * @param CoinFormatter|int|float $amount
     * @param User|WalletAccount|string $target
     * @param string $description
     * @return TransferRecord|TransferException
     * @throws \Throwable
     */
    protected function send($amount, $target, $description)
    {
        $account = $this->walletAccount;

        $transferRecord = Cache::lock($account->getLockKey())
            ->get(function () use ($amount, $target, $description, $account) {
                $account = $account->fresh();
                $targetAccount = $this->parseTarget($target, $account);
                $amount = $this->parseAmount($amount, $account);

                if ($amount->getValue() <= 0) {
                    throw new TransferException(trans('wallet.invalid_amount'), 422);
                }

                if ($targetAccount instanceof WalletAccount) {
                    return DB::transaction(function () use ($targetAccount, $amount, $description, $account) {
                        if ($account->balance_on_trade < $amount->getValue()) {
                            throw new TransferException(trans('wallet.insufficient_available'), 422);
                        }

                        $account->transferRecords()->updateOrcreate([
                            'type'        => 'send',
                            'description' => $description
                        ], [
                            'dollar_price'           => $this->dollar_price,
                            'confirmations'          => 0,
                            'required_confirmations' => 0,
                            'value'                  => $amount->getAmount(),
                        ]);

                        return $targetAccount->transferRecords()->updateOrcreate([
                            'type'        => 'receive',
                            'description' => $description
                        ], [
                            'dollar_price'           => $this->dollar_price,
                            'confirmations'          => 0,
                            'required_confirmations' => 0,
                            'value'                  => $amount->getAmount(),
                        ]);
                    });
                }

                throw new TransferException(trans('wallet.invalid_target_account'), 403);
            });

        if (!$transferRecord) {
            return abort(403, trans('wallet.account_in_use'));
        }

        return $transferRecord;
    }

    /**
     * Process marketplace trade
     *
     * @param User $user
     * @return void
     * @throws \Throwable
     */
    public function process($user)
    {
        if (!$this->canBeApprovedBy($user)) {
            return abort(403, trans('auth.access_forbidden'));
        }

        Cache::lock($this->getLockKey())->get(function () {
            $trade = $this->fresh();
            DB::transaction(function () use ($trade) {
                $amountObject = $trade->getAmountObject();
                $feeObject = $trade->getFeeObject();

                $paymentDesc = "tradePayment-" . $trade->id;
                $amountRecord = $trade->send($amountObject, $trade->buyer, $paymentDesc);

                if ($feeObject->getValue() > 0) {
                    try {
                        $account = $trade->walletAccount;

                        $escrow = $trade->getEscrowUser();
                        $escrowAccount = $account->wallet->getAccount($escrow);

                        if (!$account->is($escrowAccount)) {
                            $feeDesc = "tradeFee-" . $trade->id;
                            $feeRecord = $trade->send($feeObject, $escrowAccount, $feeDesc);
                            $escrow->notify(new ConfirmedReceive($feeRecord));
                        }

                        $trade->logFeeCharges($feeObject, $escrowAccount);
                    } catch (Exception $exception) {
                        report($exception);
                    }
                }

                $trade->buyer->notify(new ConfirmedReceive($amountRecord));
                $trade->update(['status' => 'successful']);
            });

            chatMessage('activity')->by(Auth::user())
                ->content([
                    'type'       => 'marketplace_trade_approved',
                    'parameters' => getTradeChatParameters($trade)
                ])
                ->save($trade->chat);

            $trade->seller->notify(new TradeCompleted($trade));
            $trade->buyer->notify(new TradeCompleted($trade));
        });
    }

    /**
     * Get the key used for atomic locks
     *
     * @return string
     */
    public function getLockKey()
    {
        return "lock.marketplaceTrade.{$this->id}";
    }

    /**
     * Log fee charges.
     *
     * @param CoinFormatter $amount
     * @param WalletAccount $account
     */
    protected function logFeeCharges($amount, $account)
    {
        $dollarAmount = $amount->getPrice('USD', $this->dollar_price);
        $description = trans('marketplace.trade_charge_description', ['token' => $this->id]);

        $charge = new MarketplaceCharge([
            'dollar_amount' => $dollarAmount,
            'description'   => $description
        ]);

        $charge->walletAccount()->associate($account);
        $charge->save();
    }

    /**
     * Get escrow user
     *
     * @param User $user
     * @param Wallet $wallet
     * @return User|null
     */
    protected function getEscrowUser()
    {
        $role = config('permission.super_admin_role');
        return User::role($role)->firstOr(function () {
            throw new ModelNotFoundException();
        });
    }
}
