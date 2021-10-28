<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethodCategory extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany|PaymentMethod[]
	 */
    public function paymentMethods()
    {
    	return $this->hasMany(PaymentMethod::class, 'category_id', 'id');
    }
}
