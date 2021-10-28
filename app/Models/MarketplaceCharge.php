<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceCharge extends Model
{
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
		'walletAccount',
	];

	/**
	 * The accessors to append to the model's array form.
	 *
	 * @var array
	 */
	protected $appends = [
		'amount',
		'formatted_amount',
	];

	/**
	 * Get amount attribute
	 *
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
	public function getAmountAttribute()
	{
		return currency($this->dollar_amount, 'USD', $this->walletAccount->user->currency);
	}

	/**
	 * Get formatted amount attribute
	 *
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
	public function getFormattedAmountAttribute()
	{
		return currency($this->dollar_amount, 'USD', $this->walletAccount->user->currency, true);
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|WalletAccount
	 */
	public function walletAccount()
	{
		return $this->belongsTo(WalletAccount::class, 'wallet_account_id', 'id');
	}
}
