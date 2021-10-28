<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
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
	protected $with = ['category'];

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany|Fee
	 */
	public function walletFees()
	{
		return $this->hasMany(Fee::class, 'payment_method_id', 'id')
			->with('wallet');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|PaymentMethodCategory
	 */
	public function category()
	{
		return $this->belongsTo(PaymentMethodCategory::class, 'category_id', 'id');
	}
}
