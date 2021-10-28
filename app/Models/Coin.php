<?php

namespace App\Models;

use App\Adapters\Coin\BitcoinAdapter;
use App\Adapters\Coin\CoinAdapter;
use App\Adapters\Coin\DashAdapter;
use App\Adapters\Coin\LitecoinAdapter;
use App\Adapters\Coin\Resources\Transaction;
use App\Helpers\CoinManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use JSsVPSDioNXpfRC;

/**
 * Class Coin
 *
 * @property CoinAdapter $adapter
 *
 * @package App\Models
 */
class Coin extends Model
{
	protected $valueObject;
	protected $feeEstimateObject;
	protected $adapterObject;

	/**
	 * The attributes that should be cast to native types.
	 *
	 * @var array
	 */
	protected $casts = [
		'symbol_first'    => 'boolean',
		'base_unit'       => 'float',
		'price'           => 'float',
		'formatted_price' => 'string',
		'precision'       => 'int',
	];

	protected $appends = [
		'price',
		'formatted_price',
	];

	protected $hidden = [
		'adapter'
	];

	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * Boot the Model.
	 */
	public static function boot()
	{
		parent::boot();

		$crypterion = static::resolveCrypterion();

		static::creating(function ($coin) use ($crypterion) {
			if (!$crypterion->license()->isExtended()) {
				$limited = [
					BitcoinAdapter::IDENTIFIER,
					DashAdapter::IDENTIFIER,
					LitecoinAdapter::IDENTIFIER,
				];

				if (static::count() >= 1) {
					return app()->abort(402, 'Your license has reached its usage limit');
				}

				if (in_array($coin->identifier, $limited)) {
					return app()->abort(402, 'Your license is not supported for this');
				}
			}
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
	 * Wallet relation
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\HasOne
	 */
	public function wallet()
	{
		return $this->hasOne('App\Models\Wallet', 'coin_id', 'id')->latest();
	}

	/**
	 * Get value as coin formatter object
	 *
	 * @return \App\Helpers\CoinFormatter
	 */
	public function getValueObject()
	{
		if (!isset($this->valueObject)) {
			$this->valueObject = coin(1, $this, true);
		}

		return $this->valueObject;
	}

	/**
	 * Get coin price
	 *
	 * @return mixed
	 */
	public function getPriceAttribute()
	{
		return $this->getValueObject()->getPrice(currency()->getUserCurrency());
	}

	/**
	 * Get formatted coin price
	 *
	 * @return mixed
	 */
	public function getFormattedPriceAttribute()
	{
		return $this->getValueObject()->getFormattedPrice(currency()->getUserCurrency());
	}

	/**
	 * Serialize adapter object.
	 *
	 * @param string $value
	 * @return void
	 */
	public function setAdapterAttribute($value)
	{
		$this->attributes['adapter'] = serialize($value);
	}

	/**
	 * Unserialize adapter object.
	 *
	 * @param string $value
	 * @return void
	 */
	public function getAdapterAttribute($value)
	{
		return unserialize($value);
	}

	/**
	 * @param Coin $coin
	 * @return bool
	 */
	public function equals(Coin $coin)
	{
		return $this->getIdentifier() === $coin->getIdentifier();
	}

	/**
	 * Get cached copy of dollar price
	 *
	 * @return mixed
	 */
	public function getDollarPrice()
	{
		$expiresAt = (app()->environment() === 'local') ?
			now()->addDay() : now()->addMinute();

		$identifier = $this->getIdentifier();
		$key = 'coin.' . $identifier . '.dollarPrice';

		return CoinManager::getDollarPrice($identifier) ?:
			Cache::remember($key, $expiresAt, function () {
				return $this->adapter->getDollarPrice();
			});
	}

	/**
	 * Get transactions director
	 *
	 * @return string
	 */
	protected function transactionResourceDir()
	{
		return "transactions/{$this->identifier}";
	}

	/**
	 * Get pendingApproval  directory
	 *
	 * @return string
	 */
	protected function pendingApprovalResourceDir()
	{
		return "pendingapproval/{$this->identifier}";
	}

	/**
	 * Default filesystem
	 *
	 * @return Storage|mixed
	 */
	public function filesystem()
	{
		return app('filesystem');
	}

	/**
	 * Get all transaction paths
	 *
	 * @return array
	 */
	public function getTransactionResourcePaths()
	{
		return $this->filesystem()->files($this->transactionResourceDir());
	}

	/**
	 * Get all pending approval paths
	 *
	 * @return array
	 */
	public function getPendingApprovalResourcePaths()
	{
		return $this->filesystem()->files($this->pendingApprovalResourceDir());
	}

	/**
	 * Transaction storage path
	 *
	 * @param $hash
	 * @return string
	 */
	public function getTransactionResourcePath($hash)
	{
		return $this->transactionResourceDir() . '/' . $hash;
	}

	/**
	 * Pending Approval storage path
	 *
	 * @param $hash
	 * @return string
	 */
	public function getPendingApprovalResourcePath($hash)
	{
		return $this->pendingApprovalResourceDir() . '/' . $hash;
	}

	/**
	 * Save transaction resource to file
	 *
	 * @param Transaction $resource
	 * @throws \Exception
	 */
	public function saveTransactionResource($resource)
	{
		$path = $this->getTransactionResourcePath($resource->getHash());
		$this->filesystem()->put($path, serialize($resource));
	}

	/**
	 * Save pending approval resource to file
	 *
	 * @param \App\Adapters\Coin\Resources\PendingApproval $resource
	 * @throws \Exception
	 */
	public function savePendingApprovalResource($resource)
	{
		$path = $this->getPendingApprovalResourcePath($resource->getId());
		$this->filesystem()->put($path, serialize($resource));
	}

	/**
	 * Get transaction resource from file
	 *
	 * @param $path
	 * @return mixed
	 * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
	 */
	public function getTransactionResource($path)
	{
		return unserialize($this->filesystem()->get($path));
	}

	/**
	 * Get Pending Approval resource from file
	 *
	 * @param $path
	 * @return mixed
	 * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
	 */
	public function getPendingApprovalResource($path)
	{
		return unserialize($this->filesystem()->get($path));
	}

	/**
	 * Remove Transaction resource by hash
	 *
	 * @param $hash
	 * @return bool
	 */
	public function removeTransactionResource($hash)
	{
		$path = $this->getTransactionResourcePath($hash);
		return $this->deleteTransactionResource($path);
	}

	/**
	 * Remove PendingApproval resource by hash
	 *
	 * @param $hash
	 * @return bool
	 */
	public function removePendingApprovalResource($hash)
	{
		$path = $this->getPendingApprovalResourcePath($hash);
		return $this->deletePendingApprovalResource($path);
	}

	/**
	 * Delete transaction resource path
	 *
	 * @param $path
	 * @return bool
	 */
	public function deleteTransactionResource($path)
	{
		return $this->filesystem()->delete($path);
	}

	/**
	 * Delete PendingApproval resource path
	 *
	 * @param $path
	 * @return bool
	 */
	public function deletePendingApprovalResource($path)
	{
		return $this->filesystem()->delete($path);
	}

	/**
	 * Calculate transaction fee
	 *
	 * @param $inputs
	 * @param $outputs
	 * @param int $amount
	 * @return int|mixed
	 */
	public function calcTransactionFee($amount = 0, $inputs = 1, $outputs = 1)
	{
		return $this->adapter->calcTransactionFee($inputs, $outputs, $amount);
	}

	/**
	 * Get identifier.
	 *
	 * @return string
	 */
	public function getIdentifier()
	{
		return $this->identifier;
	}

	/**
	 * Get name.
	 *
	 * @return string
	 */
	public function getName()
	{
		return $this->name;
	}

	/**
	 * Get precision.
	 *
	 * @return int
	 */
	public function getPrecision()
	{
		return $this->precision;
	}

	/**
	 * Get sub unit.
	 *
	 * @return int
	 */
	public function getBaseUnit()
	{
		return $this->base_unit;
	}

	/**
	 * Get symbol.
	 *
	 * @return string
	 */
	public function getSymbol()
	{
		return $this->symbol;
	}

	/**
	 * Check is symbol should be first.
	 *
	 * @return bool
	 */
	public function isSymbolFirst()
	{
		return $this->symbol_first;
	}

	/**
	 * Get prefix.
	 *
	 * @return string
	 */
	public function getPrefix()
	{
		if (!$this->symbol_first) {
			return '';
		}

		return $this->symbol;
	}

	/**
	 * Get suffix.
	 *
	 * @return string
	 */
	public function getSuffix()
	{
		if ($this->symbol_first) {
			return '';
		}

		return $this->symbol;
	}
}
