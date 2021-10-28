<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletAddress extends Model
{
	protected $totalReceived;
	protected $totalReceivedObject;

	protected $hidden = [
		'data'
	];

	protected $appends = [
		'total_received',
		'total_received_price',
		'formatted_total_received_price',
		'reset_webhook'
	];

	/**
	 * The attributes that should be cast to native types.
	 *
	 * @var array
	 */
	protected $casts = [
		'data'    => 'array',
		'pending' => 'boolean'
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
	protected $with = ['walletAccount'];

	/**
	 * Sum total received
	 *
	 * @return mixed
	 */
	public function getTotalReceived()
	{
		if (!isset($this->totalReceived)) {
			$this->totalReceived = $this->transferRecords()
				->where('type', 'receive')
				->whereColumn('confirmations',  '>=', 'required_confirmations')
				->sum('value');
		}

		return $this->totalReceived;
	}

	public function getTotalReceivedObject()
	{
		if (!isset($this->totalReceivedObject)) {
			$this->totalReceivedObject = coin($this->getTotalReceived(), $this->walletAccount->wallet->coin);
		}

		return $this->totalReceivedObject;
	}

	public function getTotalReceivedAttribute()
	{
		return $this->getTotalReceivedObject()->getValue();
	}

	public function getTotalReceivedPriceAttribute()
	{
		return $this->getTotalReceivedObject()->getPrice($this->walletAccount->user->currency);
	}

	public function getFormattedTotalReceivedPriceAttribute()
	{
		return $this->getTotalReceivedObject()->getFormattedPrice($this->walletAccount->user->currency);
	}

	public function getResetWebhookAttribute()
	{
		$adapter = $this->walletAccount->wallet->coin->adapter;

		return method_exists($adapter, "setWalletAddressTransactionWebhooks") &&
			env('ALLOW_RESET_ADDRESS_WEBHOOK', false);
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|Wallet
	 */
	public function wallet()
	{
		return $this->belongsTo('App\Models\Wallet', 'wallet_id', 'id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|WalletAccount
	 */
	public function walletAccount()
	{
		return $this->belongsTo('App\Models\WalletAccount', 'wallet_account_id', 'id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany|TransferRecord
	 */
	public function transferRecords()
	{
		return $this->hasMany('App\Models\TransferRecord', 'receiver_wallet_address_id', 'id');
	}
}
