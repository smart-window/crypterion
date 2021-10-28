<?php

namespace App\Models;

use App\Adapters\Coin\Resources\PendingApproval;
use App\Adapters\Coin\Resources\Transaction;
use App\Events\WalletAccountSaved;
use App\Helpers\CoinFormatter;
use App\Models\Exceptions\TransferException;
use App\Notifications\Wallet\ConfirmedReceive;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use JSsVPSDioNXpfRC;

class WalletAccount extends Model
{
    protected $priceObject;
    protected $minTransferableObject;
    protected $maxTransferableObject;
    protected $balanceAttribute;
    protected $balanceObject;
    protected $balanceOnTradeAttribute;
    protected $balanceOnTradeObject;
    protected $availableAttribute;
    protected $availableObject;
    protected $totalReceivedAttribute;
    protected $totalReceivedObject;
    protected $totalSentAttribute;
    protected $totalSentObject;
    protected $totalUnspentsByAddress;

    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = ['wallet', 'user'];

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'saved' => WalletAccountSaved::class,
    ];

    protected $appends = [
        'min_transferable',
        'min_transferable_price',
        'formatted_min_transferable_price',
        'max_transferable',
        'max_transferable_price',
        'formatted_max_transferable_price',
        'balance_on_trade',
        'balance_on_trade_price',
        'formatted_balance_on_trade_price',
        'balance',
        'balance_price',
        'formatted_balance_price',
        'available',
        'available_price',
        'formatted_available_price',
        'total_received',
        'total_received_price',
        'formatted_total_received_price',
        'total_sent',
        'total_sent_price',
        'formatted_total_sent_price',
        'coin',
        'price',
        'formatted_price',
    ];

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
     * @return \App\Helpers\CoinFormatter|mixed
     */
    public function getMinTransferableObject()
    {
        if (!isset($this->minTransferableObject)) {
            $coin = $this->wallet->coin;
            $minTransferable = $coin->adapter->getMinimumTransferable();
            $this->minTransferableObject = coin($minTransferable, $coin);
        }

        return $this->minTransferableObject;
    }

    /**
     * @return float
     */
    public function getMinTransferableAttribute()
    {
        return $this->getMinTransferableObject()->getValue();
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getMinTransferablePriceAttribute()
    {
        return $this->getMinTransferableObject()->getPrice($this->user->currency);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedMinTransferablePriceAttribute()
    {
        return $this->getMinTransferableObject()->getFormattedPrice($this->user->currency);
    }

    /**
     * @return \App\Helpers\CoinFormatter|mixed
     */
    public function getMaxTransferableObject()
    {
        if (!isset($this->maxTransferableObject)) {
            $coin = $this->wallet->coin;
            $maxTransferableObject = coin($coin->adapter->getMaximumTransferable(), $coin);
            $this->maxTransferableObject = $maxTransferableObject;
        }

        return $this->maxTransferableObject;
    }

    /**
     * @return float
     */
    public function getMaxTransferableAttribute()
    {
        return $this->getMaxTransferableObject()->getValue();
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getMaxTransferablePriceAttribute()
    {
        return $this->getMaxTransferableObject()->getPrice($this->user->currency);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedMaxTransferablePriceAttribute()
    {
        return $this->getMaxTransferableObject()->getFormattedPrice($this->user->currency);
    }

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Calculate Available Balance
     *
     * @return mixed
     */
    public function getAvailable()
    {
        if (!isset($this->availableAttribute)) {
            $this->availableAttribute = $this->getBalance() - $this->getBalanceOnTrade();
        }
        return $this->availableAttribute;
    }

    /**
     * @return \App\Helpers\CoinFormatter|mixed
     */
    public function getAvailableObject()
    {
        if (!isset($this->availableObject)) {
            $this->availableObject = coin($this->getAvailable(), $this->wallet->coin);
        }
        return $this->availableObject;
    }

    /**
     * @return float
     */
    public function getAvailableAttribute()
    {
        return $this->getAvailableObject()->getValue();
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getAvailablePriceAttribute()
    {
        return $this->getAvailableObject()->getPrice($this->user->currency);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedAvailablePriceAttribute()
    {
        return $this->getAvailableObject()->getFormattedPrice($this->user->currency);
    }


    /**
     * Calculate Balance on a pending trade
     *
     * @return mixed
     */
    public function getBalanceOnTrade()
    {
        if (!isset($this->balanceOnTradeAttribute)) {
            $balance = $this->marketplaceTrades()
                ->whereIn('status', ['active', 'dispute'])
                ->sum(DB::raw('fee + amount'));

            $this->balanceOnTradeAttribute = $balance;
        }
        return $this->balanceOnTradeAttribute;
    }

    /**
     * @return \App\Helpers\CoinFormatter|mixed
     */
    public function getBalanceOnTradeObject()
    {
        if (!isset($this->balanceOnTradeObject)) {
            $this->balanceOnTradeObject = coin($this->getBalanceOnTrade(), $this->wallet->coin);
        }
        return $this->balanceOnTradeObject;
    }

    /**
     * @return float
     */
    public function getBalanceOnTradeAttribute()
    {
        return $this->getBalanceOnTradeObject()->getValue();
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getBalanceOnTradePriceAttribute()
    {
        return $this->getBalanceOnTradeObject()->getPrice($this->user->currency);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedBalanceOnTradePriceAttribute()
    {
        return $this->getBalanceOnTradeObject()->getFormattedPrice($this->user->currency);
    }

    /**
     * Calculate Balance
     *
     * @return mixed
     */
    public function getBalance()
    {
        if (!isset($this->balanceAttribute)) {
            $this->balanceAttribute = $this->getTotalReceived() - $this->getTotalSent();
        }
        return $this->balanceAttribute;
    }

    /**
     * @return \App\Helpers\CoinFormatter|mixed
     */
    public function getBalanceObject()
    {
        if (!isset($this->balanceObject)) {
            $this->balanceObject = coin($this->getBalance(), $this->wallet->coin);
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
        return $this->getBalanceObject()->getPrice($this->user->currency);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedBalancePriceAttribute()
    {
        return $this->getBalanceObject()->getFormattedPrice($this->user->currency);
    }

    /**
     * Sum total received
     *
     * @return mixed
     */
    public function getTotalReceived()
    {
        if (!isset($this->totalReceivedAttribute)) {
            $this->totalReceivedAttribute = $this->transferRecords()
                ->where('type', 'receive')
                ->whereColumn('confirmations', '>=', 'required_confirmations')
                ->sum('value');
        }
        return $this->totalReceivedAttribute;
    }

    /**
     * @return \App\Helpers\CoinFormatter|mixed
     */
    public function getTotalReceivedObject()
    {
        if (!isset($this->totalReceivedObject)) {
            $this->totalReceivedObject = coin($this->getTotalReceived(), $this->wallet->coin);
        }
        return $this->totalReceivedObject;
    }

    /**
     * @return float
     */
    public function getTotalReceivedAttribute()
    {
        return $this->getTotalReceivedObject()->getValue();
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getTotalReceivedPriceAttribute()
    {
        return $this->getTotalReceivedObject()->getPrice($this->user->currency);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedTotalReceivedPriceAttribute()
    {
        return $this->getTotalReceivedObject()->getFormattedPrice($this->user->currency);
    }

    /**
     * Sum total sent
     *
     * @return mixed
     */
    public function getTotalSent()
    {
        if (!isset($this->totalSentAttribute)) {
            $this->totalSentAttribute = $this->transferRecords()
                ->where('type', 'send')
                ->sum('value');
        }
        return $this->totalSentAttribute;
    }

    /**
     * @return \App\Helpers\CoinFormatter|mixed
     */
    public function getTotalSentObject()
    {
        if (!isset($this->totalSentObject)) {
            $this->totalSentObject = coin($this->getTotalSent(), $this->wallet->coin);
        }

        return $this->totalSentObject;
    }

    /**
     * @return float
     */
    public function getTotalSentAttribute()
    {
        return $this->getTotalSentObject()->getValue();
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getTotalSentPriceAttribute()
    {
        return $this->getTotalSentObject()->getPrice($this->user->currency);
    }

    /**
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    public function getFormattedTotalSentPriceAttribute()
    {
        return $this->getTotalSentObject()->getFormattedPrice($this->user->currency);
    }

    /**
     * Calculate transaction fee
     *
     * @param int $amount
     * @param int $inputs
     * @param int $outputs
     * @return int|mixed
     */
    public function calcTransactionFee($amount = 0, $outputs = 1)
    {
        $unspentsCount = $this->totalUnspentsByAddress()->count();
        $coin = $this->wallet->coin;

        $inputs = ($unspentsCount > 1) ? $unspentsCount : 1;

        return $coin->calcTransactionFee($amount, $inputs, $outputs);
    }

    /**
     * Get total unspents by address
     *
     * @return \Illuminate\Support\Collection
     */
    public function totalUnspentsByAddress()
    {
        if (!isset($this->totalUnspentsByAddress)) {
            $lastSent = $this->transferRecords()
                ->where('type', 'send')
                ->whereNotNull('wallet_transaction_id')
                ->latest()->first();

            $query = $this->transferRecords()
                ->select('receiver_wallet_address_id', DB::raw('count(*) as total'))
                ->where('type', 'receive')
                ->whereNotNull('wallet_transaction_id')
                ->groupBy('receiver_wallet_address_id');

            if ($lastSent) {
                $query = $query->where('created_at', '>=', $lastSent->created_at);
            }

            $this->totalUnspentsByAddress = $query->get();
        }
        return $this->totalUnspentsByAddress;
    }

    /**
     * Get coin price
     *
     * @return mixed
     */
    public function getPriceAttribute()
    {
        return $this->wallet->coin
            ->getValueObject()
            ->getPrice($this->user->currency);
    }

    /**
     * Get formatted coin price
     *
     * @return mixed
     */
    public function getFormattedPriceAttribute()
    {
        return $this->wallet->coin
            ->getValueObject()
            ->getFormattedPrice($this->user->currency);
    }

    /**
     * Get coin name
     *
     * @return mixed|string
     */
    public function getCoinAttribute()
    {
        return $this->wallet->coin->name;
    }

    /**
     * Parse amount as CoinFormatter object
     *
     * @param $amount
     * @return CoinFormatter
     * @throws Exception
     */
    public function parseAmount($amount)
    {
        if (is_numeric($amount)) {
            return coin($amount, $this->wallet->coin, true);
        }

        if ($amount instanceof CoinFormatter) {
            return $amount;
        }

        throw new TransferException("Invalid amount.", 422);
    }

    /**
     * Parse target as either a user a wallet account or external address
     *
     * @param User|WalletAccount|string $target
     * @return WalletAccount|string
     * @throws Exception
     */
    public function parseTarget($target)
    {
        if ($target instanceof WalletAccount) {
            if ($target->is($this)) {
                throw new TransferException(trans('wallet.cannot_send_to_same_account'), 403);
            }

            if (!$target->wallet->is($this->wallet)) {
                throw new TransferException(trans('wallet.different_account_parent_wallet'), 403);
            }

            return $target;
        } else if (is_string($target)) {
            if (filter_var($target, FILTER_VALIDATE_EMAIL)) {
                $user = User::where('email', $target)->first();
                if (!$user) {
                    throw new TransferException(trans('auth.user_email_not_found', ['email' => $target]), 404);
                } else {
                    if ($user->is($this->user)) {
                        throw new TransferException(trans('wallet.cannot_send_to_same_user'), 403);
                    }
                }

                return $this->wallet->getAccount($user);
            } else {
                $walletAddress = WalletAddress::where('address', $target)->first();
                if (!$walletAddress) return $target;

                $account = $walletAddress->walletAccount;
                if ($account->is($this)) {
                    throw new TransferException(trans('wallet.cannot_send_to_same_account'), 403);
                }
                if (!$account->wallet->is($this->wallet)) {
                    throw new TransferException(trans('wallet.different_account_parent_wallet'), 403);
                }
                return $account;
            }
        } else if ($target instanceof User) {
            if ($target->is($this->user)) {
                throw new TransferException(trans('wallet.cannot_send_to_same_user'), 403);
            }

            return $this->wallet->getAccount($target);
        }
    }

    /**
     * Handle internal and external transfer
     *
     * @param CoinFormatter|int|float $amount
     * @param User|WalletAccount|string $target
     * @param string $description
     * @return TransferRecord|TransferException
     * @throws \Throwable
     */
    public function send($amount, $target, $description = null)
    {
        $transferRecord = Cache::lock($this->getLockKey())
            ->get(function () use ($amount, $target, $description) {
                $account = $this->fresh();
                $target = $account->parseTarget($target);
                $amount = $account->parseAmount($amount);

                $coin = $account->wallet->coin;

                if ($amount->getValue() <= 0) {
                    throw new TransferException(trans('wallet.invalid_amount'), 422);
                }

                if (is_string($target)) {
                    return DB::transaction(function () use ($account, $coin, $target, $amount, $description) {
                        $transactionFee = $account->calcTransactionFee($amount->getAmount());
                        $withdrawalFee = $account->wallet->calcWithdrawalFee($amount->getAmount());
                        $fee = coin($transactionFee + $withdrawalFee, $coin);
                        $deductible = coin(($amount->getAmount() + $fee->getAmount()), $coin);

                        if ($account->available < $deductible->getValue()) {
                            throw new TransferException(trans('wallet.insufficient_available'), 422);
                        }

                        $resource = $account->wallet->send($target, $amount->getAmount());

                        $account->chargeWithdrawalFee($withdrawalFee);
                        $description = $this->getExtSendDesc($description, $target);

                        if ($resource instanceof Transaction) {
                            $transaction = $account->wallet->transactions()->create([
                                'hash'          => $resource->getHash(),
                                'type'          => $resource->getType(),
                                'source_id'     => $resource->getId(),
                                'value'         => $resource->getValue(),
                                'date'          => $resource->getDate(),
                                'confirmations' => $resource->getConfirmations(),
                                'input'         => $resource->getInput(),
                                'output'        => $resource->getOutput(),
                                'data'          => $resource->getData(),
                            ]);

                            return $account->transferRecords()->create([
                                'type'                   => 'send',
                                'dollar_price'           => $coin->getDollarPrice(),
                                'wallet_transaction_id'  => $transaction->id,
                                'confirmations'          => $transaction->confirmations,
                                'required_confirmations' => 1,
                                'value'                  => $deductible->getAmount(),
                                'description'            => $description
                            ]);
                        } else if ($resource instanceof PendingApproval) {
                            $record = $account->transferRecords()->create([
                                'type'                   => 'send',
                                'dollar_price'           => $coin->getDollarPrice(),
                                'confirmations'          => 0,
                                'required_confirmations' => 1,
                                'value'                  => $deductible->getAmount(),
                                'description'            => $description
                            ]);

                            $record->pendingApproval()->create([
                                'source_id' => $resource->getId(),
                                'state'     => $resource->getState(),
                                'scope'     => $resource->getScope(),
                                'info'      => $resource->getInfo(),
                                'data'      => $resource->getData(),
                            ]);
                            return $record;
                        }
                    });
                } else if ($target instanceof WalletAccount) {
                    return DB::transaction(function () use ($account, $coin, $target, $amount, $description) {
                        if ($account->available < $amount->getValue()) {
                            throw new TransferException(trans('wallet.insufficient_available'), 422);
                        }

                        $sendDesc = $this->getIntSendDesc($description, $target->user->name);
                        $record = $account->transferRecords()->create([
                            'type'                   => 'send',
                            'dollar_price'           => $coin->getDollarPrice(),
                            'confirmations'          => 0,
                            'required_confirmations' => 0,
                            'value'                  => $amount->getAmount(),
                            'description'            => $sendDesc
                        ]);

                        $receiveDesc = $this->getIntReceiveDesc($description, $account->user->name);
                        $targetRecord = $target->transferRecords()->create([
                            'type'                   => 'receive',
                            'dollar_price'           => $coin->getDollarPrice(),
                            'confirmations'          => 0,
                            'required_confirmations' => 0,
                            'value'                  => $amount->getAmount(),
                            'description'            => $receiveDesc
                        ]);

                        $target->user->notify(new ConfirmedReceive($targetRecord));
                        return $record;
                    });
                }

                throw new TransferException(trans('wallet.invalid_target_account'), 403);
            });

        if (!$transferRecord) {
            abort(403, trans('wallet.account_in_use'));
        }

        return $transferRecord;
    }

    /**
     * Get internal send description
     *
     * @param $desc
     * @param $fromUser
     * @return mixed|string|null
     */
    protected function getIntSendDesc($desc, $toUser)
    {
        $text = trans('wallet.internal_send_desc', ['user' => $toUser]);
        return is_string($desc) ? $text . " - " . $desc : $text;
    }

    /**
     * Get internal received description
     *
     * @param $desc
     * @param $fromUser
     * @return mixed|string|null
     */
    protected function getIntReceiveDesc($desc, $fromUser)
    {
        $text = trans('wallet.internal_receive_desc', ['user' => $fromUser]);
        return is_string($desc) ? $text . " - " . $desc : $text;
    }


    /**
     * Get external send description
     *
     * @param $desc
     * @param $address
     * @return mixed|string|null
     */
    protected function getExtSendDesc($desc, $address)
    {
        $text = trans('wallet.external_send_desc', ['address' => $address]);
        return is_string($desc) ? $text . " - " . $desc : $text;
    }

    /**
     * Charge Withdrawal Fee
     *
     * @param $amount
     * @return TransferRecord|Model|\Illuminate\Database\Eloquent\Relations\HasMany
     */
    protected function chargeWithdrawalFee($amount)
    {
        $amount = coin($amount, $coin = $this->wallet->coin);

        if ($amount->getValue() > 0) {
            try {
                $adminAccount = $this->wallet->getAccount($this->getAdmin());

                if (!$this->is($adminAccount)) {
                    return $adminAccount->transferRecords()->create([
                        'type'                   => 'receive',
                        'dollar_price'           => $coin->getDollarPrice(),
                        'confirmations'          => 0,
                        'required_confirmations' => 0,
                        'value'                  => $amount->getAmount(),
                        'description'            => "Withdrawal Fee"
                    ]);
                }
            } catch (Exception $exception) {
                report($exception);
            }
        }
    }

    /**
     * Get admin user
     *
     * @param User $user
     * @param Wallet $wallet
     * @return User|null
     */
    protected function getAdmin()
    {
        $role = config('permission.super_admin_role');
        return User::role($role)->firstOr(function () {
            throw new ModelNotFoundException();
        });
    }

    /**
     * Get the key used for atomic locks
     *
     * @return string
     */
    public function getLockKey()
    {
        return "lock.walletAccount.{$this->id}";
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|Wallet
     */
    public function wallet()
    {
        return $this->belongsTo('App\Models\Wallet', 'wallet_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|WalletAddress
     */
    public function walletAddresses()
    {
        return $this->hasMany('App\Models\WalletAddress', 'wallet_account_id', 'id')
            ->where('pending', false)->latest();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|TransferRecord
     */
    public function transferRecords()
    {
        return $this->hasMany('App\Models\TransferRecord', 'wallet_account_id', 'id');
    }

    /**
     * Marketplace trades relation
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function marketplaceTrades()
    {
        return $this->hasMany(MarketplaceTrade::class, 'wallet_account_id', 'id');
    }

    /**
     * @param $address
     * @return bool
     */
    public function hasWalletAddress($address)
    {
        return $this->walletAddresses()->where('address', $address)
            ->exists();
    }
}
