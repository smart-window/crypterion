<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
	protected $hidden = [
		'data'
	];

	/**
	 * The attributes that should be mutated to dates.
	 *
	 * @var array
	 */
	protected $dates = [
		'date',
	];

	/**
	 * The attributes that should be cast to native types.
	 *
	 * @var array
	 */
	protected $casts = [
		'data'          => 'array',
		'confirmations' => 'integer',
		'value'         => 'float'
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
	protected $with = ['wallet'];

	public function setInputAttribute($value)
	{
		if(is_array($value)){
			$this->attributes['input'] = json_encode($value);
		}else{
			$this->attributes['input'] = $value;
		}
	}

	public function getInputAttribute($value)
	{
		$input = json_decode($value, true);

		if(json_last_error() == JSON_ERROR_NONE){
			return $input;
		}

		return $value;
	}

	public function setOutputAttribute($value)
	{
		if(is_array($value)){
			$this->attributes['output'] = json_encode($value);
		}else{
			$this->attributes['output'] = $value;
		}
	}

	public function getOutputAttribute($value)
	{
		$output = json_decode($value, true);

		if(json_last_error() == JSON_ERROR_NONE){
			return $output;
		}

		return $value;
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo|Wallet
	 */
	public function wallet()
	{
		return $this->belongsTo('App\Models\Wallet', 'wallet_id', 'id');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany|TransferRecord
	 */
	public function transferRecords()
	{
		return $this->hasMany('App\Models\TransferRecord', 'wallet_transaction_id', 'id');
	}
}
