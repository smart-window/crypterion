<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fee extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|Wallet[]
	 */
	public function wallet()
	{
		return $this->belongsTo(Wallet::class, 'wallet_id', 'id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|PaymentMethod[]
	 */
	public function paymentMethod()
	{
		return $this->belongsTo(PaymentMethod::class, 'payment_method_id', 'id');
	}
}
