<?php

namespace App\Models;

use App\Notifications\Marketplace\TradeStarted;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class MarketplaceOffer extends Model
{
	use HasSlug;

	protected $priceObject;
	protected $rateAttribute;
	protected $successfulTradesCountAttribute;
	protected $realMaxAmountAttribute;
	protected $feeAttribute;

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
		'tags'                       => 'array',
		'require_email_verification' => 'boolean',
		'require_phone_verification' => 'boolean',
		'status'                     => 'boolean'
	];

	protected $appends = [
		'title',
		'real_max_amount',
		'formatted_real_max_amount',
		'formatted_min_amount',
		'rate',
		'formatted_rate',
		'successful_trades_count',
		'visibility',
		'fee',
	];

	/**
	 * The relationships that should always be loaded.
	 *
	 * @var array
	 */
	protected $with = [
		'walletAccount', 'paymentMethod.walletFees'
	];

	/**
	 * Get the options for generating the slug.
	 */
	public function getSlugOptions(): SlugOptions
	{
		return SlugOptions::create()
			->generateSlugsFrom(function () {
				return $this->title;
			})
			->saveSlugsTo('slug');
	}

	/**
	 * @return array|\Illuminate\Contracts\Translation\Translator|string|null
	 */
	public function getTitleAttribute()
	{
		$account = $this->walletAccount;

		if ($this->type == 'sell') {
			return trans('wallet.buy_coin_from_user', [
				'user'   => $account->user->name,
				'coin'   => $account->wallet->coin->name,
				'method' => $this->paymentMethod->name,
				'label'  => $this->label
			]);
		}

		if ($this->type == 'buy') {
			return trans('wallet.sell_coin_to_user', [
				'user'   => $account->user->name,
				'coin'   => $account->wallet->coin->name,
				'method' => $this->paymentMethod->name,
				'label'  => $this->label
			]);
		}
	}

	/**
	 * Get the route key for the model.
	 *
	 * @return string
	 */
	public function getRouteKeyName()
	{
		return 'slug';
	}

	/**
	 * Get wallet account for this offer
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function walletAccount()
	{
		return $this->belongsTo(WalletAccount::class, 'wallet_account_id', 'id');
	}

	/**
	 * Get payment method for this offer
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function paymentMethod()
	{
		return $this->belongsTo(PaymentMethod::class, 'payment_method_id', 'id');
	}

	/**
	 * All associated trades
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function trades()
	{
		return $this->hasMany(MarketplaceTrade::class, 'offer_id', 'id');
	}

	/**
	 * The user who owns this offer.
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user()
	{
		return $this->belongsTo(User::class, 'user_id', 'id');
	}

	/**
	 * Get fee for this payment method
	 *
	 * @return bool|float|mixed
	 */
	public function getFeeAttribute()
	{
		if (!isset($this->feeAttribute)) {
			$wallet = $this->walletAccount->wallet;

			$result = $this->paymentMethod->walletFees->where('wallet_id', $wallet->id);

			if ($walletFee = $result->first()) {
				$this->feeAttribute = $walletFee->marketplace_fee ?: $wallet->marketplace_fee;
			} else {
				$this->feeAttribute = $wallet->marketplace_fee;
			}
		}

		return $this->feeAttribute;
	}

	public function setFilterUsersAttribute($value)
	{
		$this->attributes['filter_users'] = json_encode($value);
	}

	/**
	 * Get country iso_code in uppercase
	 *
	 * @param $value
	 * @return string
	 */
	public function getCountryAttribute($value)
	{
		return $value ? strtoupper($value) : $value;
	}

	/**
	 * Get currency iso_code in uppercase
	 *
	 * @param $value
	 * @return string
	 */
	public function getCurrencyAttribute($value)
	{
		return strtoupper($value);
	}

	/**
	 * @return mixed|string
	 */
	public function getCoinIdentifierAttribute()
	{
		return $this->walletAccount->wallet->coin->identifier;
	}

	/**
	 * @param $value
	 * @return array|mixed|null
	 */
	public function getFilterUsersAttribute($value)
	{
		$account = $this->walletAccount;

		switch ($this->privacy) {
			case 'filter_users':
				if ($value) return json_decode($value, true);
				break;
			case 'trusted_contacts':
				return $account->user->trusted_contacts->pluck('id')->toArray();
				break;
			case 'all_contacts':
				return $account->user->all_contacts->pluck('id')->toArray();
				break;
			default:
				return null;
		}
	}

	/**
	 * Calculate the percentage fee
	 *
	 * @param $value
	 * @return float|int
	 */
	public function calcPercentageFee($value)
	{
		return ($this->fee * $value) / 100;
	}

	/**
	 * Check if user can manage this offer
	 *
	 * @param User $user
	 * @return bool
	 */
	public function canBeManagedBy($user)
	{
		return $this->user->is($user) || $user->can('manage_marketplace');
	}

	/**
	 * Determine coin rate for this currency.
	 *
	 * @return float|\HolluwaTosin360\Currency\Currency|int|mixed|string|null
	 */
	public function getRateAttribute()
	{
		$account = $this->walletAccount;

		$multiplier = (100 + $this->profit_margin) / 100;

		return $multiplier * $account->wallet->coin
				->getValueObject()
				->getPrice($this->currency);
	}

	/**
	 * Get dollar rate.
	 *
	 * @return float|int
	 */
	public function getDollarRateAttribute()
	{
		$account = $this->walletAccount;

		$multiplier = (100 + $this->profit_margin) / 100;

		return $multiplier * $account->wallet->coin
				->getValueObject()
				->getPrice('USD');
	}

	/**
	 * Get formatted rate
	 *
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
	public function getFormattedRateAttribute()
	{
		return currency_format($this->rate, $this->currency);
	}

	/**
	 * Determine real maximum amount.
	 *
	 * @return float|\HolluwaTosin360\Currency\Currency|int|mixed|string|null
	 */
	public function getRealMaxAmountAttribute()
	{
		if (!isset($this->realMaxAmountAttribute)) {
			$walletAccount = $this->walletAccount;

			if (!$this->max_amount) {
				$available = $walletAccount->getAvailableObject()->getPrice($this->currency);

				$this->realMaxAmountAttribute = $available - $this->calcPercentageFee($available);
			} else {
				$this->realMaxAmountAttribute = $this->max_amount;
			}
		}

		return $this->realMaxAmountAttribute;
	}

	/**
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
	public function getFormattedRealMaxAmountAttribute()
	{
		return currency_format($this->real_max_amount, $this->currency);
	}

	/**
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
	public function getFormattedMinAmountAttribute()
	{
		return currency_format($this->min_amount, $this->currency);
	}

	/**
	 * @return int|mixed
	 */
	protected function getSuccessfulTradesCountAttribute()
	{
		if (!isset($this->successfulTradesCountAttribute)) {
			$this->successfulTradesCountAttribute = $this->trades()->where('status', 'successful')->count();
		}
		return $this->successfulTradesCountAttribute;
	}

	/**
	 * @return bool
	 */
	public function getVisibilityAttribute()
	{
		return $this->isVisible();
	}

	/**
	 * Set the terms.
	 *
	 * @param string $value
	 * @return void
	 */
	public function setTermsAttribute($value)
	{
		$this->attributes['terms'] = clean($value);
	}

	/**
	 * Set the instructions.
	 *
	 * @param string $value
	 * @return void
	 */
	public function setInstructionsAttribute($value)
	{
		$this->attributes['instructions'] = clean($value);
	}

	/**
	 * Check if offer is visible
	 *
	 * @return bool
	 */
	protected function isVisible()
	{
		$account = $this->walletAccount;

		return $this->status &&
			$account->user->canInteract() &&
			$this->canBeTraded();
	}

	/**
	 * Filter result by user.
	 *
	 * @param User $user
	 * @param bool $alwaysShowOwner
	 * @return bool
	 */
	public function filterByUser($user, $alwaysShowOwner = false)
	{
		if (!$user->is($this->walletAccount->user)) {
			$filteredUsers = $this->filter_users;

			if (is_array($filteredUsers) && !in_array($user->id, $filteredUsers)) {
				return false;
			}
		}
		return $this->isVisible() || (
				$alwaysShowOwner && $user->is($this->walletAccount->user)
			);
	}

	/**
	 * Determine if the offer can be traded
	 *
	 * @return bool|void
	 */
	public function canBeTraded()
	{
		$walletAccount = $this->walletAccount;
		$available = $walletAccount->getAvailableObject()->getPrice($this->currency);
		$minAmount = $this->min_amount;
		$maxAmount = $this->max_amount;

		switch ($this->type) {
			case "sell":
				if ($maxAmount) {
					return ($maxAmount + $this->calcPercentageFee($maxAmount)) <= $available;
				} else {
					return ($available - $this->calcPercentageFee($available) > $minAmount);
				}
				break;
			case "buy":
				return !!$maxAmount;
		}
	}

	/**
	 * @param User $user
	 * @param WalletAccount $userWalletAccount
	 * @param int|float $amount
	 * @return bool
	 */
	public function canBeTradedWith($user)
	{
		$account = $this->walletAccount;

		// Owner of the offer cannot trade with himself.
		if ($user->is($account->user)) {
			abort(403, trans('marketplace.cannot_start_trade_with_self'));
		};

		// User cannot trade if they have been cannot interact
		if (!$user->canInteract()) {
			abort(422, trans('marketplace.cannot_start_trade_at_this_time'));
		};

		// User cannot trade, if they do not pass phone verification test
		if ($this->require_phone_verification) {
			if (!$user->isPhoneVerified()) {
				abort(403, trans('marketplace.require_phone_verification'));
			};
		}

		// User cannot trade, if they do not pass email verification test
		if ($this->require_email_verification) {
			if (!$user->isEmailVerified()) {
				abort(403, trans('marketplace.require_email_verification'));
			};
		}

		// User cannot trade, if the user has been blocked by the offer owner.
		$blockedQuery = $user->blockedBy()
			->where('name', $account->user->name);

		return !($blockedQuery->exists() || !$this->filterByUser($user));
	}

	/**
	 * Determine whether to show guest this offer
	 *
	 * @return bool
	 */
	public function filterByGuest()
	{
		$filter = true;
		if (!$this->isVisible()) return false;
		if ($this->require_email_verification) return false;
		if ($this->require_phone_verification) return false;
		if ($this->filter_users) return false;
		return $filter;
	}

	/**
	 * Start trade with user
	 *
	 * @param User $user
	 * @param $amount
	 * @return MarketplaceTrade|mixed|void
	 * @throws \Exception
	 */
	public function startTradeWith($user, $amount)
	{
		if (!$this->canBeTradedWith($user)) {
			return abort(403, trans('marketplace.cannot_start_trade'));
		}

		$trade = new MarketplaceTrade();
		$wallet = $this->walletAccount->wallet;

		switch ($this->type) {
			case "sell":
				$tradingValue = $amount / $this->rate;
				$feeValue = $this->calcPercentageFee($tradingValue);

				$trading = coin($tradingValue, $wallet->coin, true);
				$fee = coin($feeValue, $wallet->coin, true);
				$account = $this->walletAccount;

				$trade->buyer()->associate($user);
				$trade->seller()->associate($this->walletAccount->user);
				break;
			case "buy":
				$tradingValue = $amount / $this->rate;
				$feeValue = $this->calcPercentageFee($tradingValue);

				$trading = coin($tradingValue - $feeValue, $wallet->coin, true);
				$fee = coin($feeValue, $wallet->coin, true);
				$account = $wallet->getAccount($user);

				$trade->buyer()->associate($this->walletAccount->user);
				$trade->seller()->associate($user);
				break;
			default:
				return abort(500);
		}

		// Check if both users already have an ongoing trade
		$ongoingTrade = MarketplaceTrade::whereHas('buyer', function ($query) use ($trade) {
			$query->where('id', $trade->buyer_id)->orWhere('id', $trade->seller_id);
		})->whereHas('seller', function ($query) use ($trade) {
			$query->where('id', $trade->buyer_id)->orWhere('id', $trade->seller_id);
		})->whereIn('status', ['active', 'dispute']);

		if ($ongoingTrade->exists()) {
			return abort(403, trans('marketplace.ongoing_trade_exists'));
		}

		$trade = Cache::lock($account->getLockKey())
			->get(function () use ($account, $amount, $fee, $trading, $trade) {
				$account = $account->fresh();
				$available = $account->getAvailableObject();

				if ($available->getValue() < ($trading->getValue() + $fee->getValue())) {
					return abort(403, trans('marketplace.insufficient_account_available'));
				}

				$trade->walletAccount()->associate($account);

				$trade->fill([
					'status'                     => 'active',
					'dollar_price'               => $this->dollar_rate,
					'amount'                     => $trading->getAmount(),
					'fee'                        => $fee->getAmount(),
					'currency'                   => $this->currency,
					'payment_method_description' => $this->paymentMethod->description,
					'payment_method_name'        => $this->paymentMethod->name,
					'label'                      => $this->label,
					'country'                    => $this->country,
					'offer_amount'               => $amount,
					'cancels_at'                 => now()->addMinutes($this->confirmation_time_frame),
					'terms'                      => $this->terms,
					'instructions'               => $this->instructions,
				]);

				DB::transaction(function () use ($trade) {
					$chat = $trade->buyer
						->privateParticipatingChats()
						->whereHas('participants', function ($query) use ($trade) {
							$query->where('user_id', $trade->seller->id);
						})
						->firstOr(function () use ($trade) {
							$chat = new Chat();
							$chat->creator()->associate($trade->buyer);
							$chat->save();

							$chat->participants()->saveMany([
								new ChatParticipant(['user_id' => $trade->buyer->id]),
								new ChatParticipant(['user_id' => $trade->seller->id]),
							]);
							return $chat;
						});

					chatMessage('activity')->by($trade->buyer)
						->content([
							'type'       => 'marketplace_trade_started',
							'parameters' => getTradeChatParameters($trade)
						])
						->save($chat);

					$trade->chat()->associate($chat);
					$this->trades()->save($trade);
				});

                $trade->seller->notify(new TradeStarted($trade));
                $trade->buyer->notify(new TradeStarted($trade));
				return $trade;
			});

		if (!$trade) {
			return abort(403, trans('wallet.account_in_use'));
		}

		return $trade;
	}
}
