<?php

use App\Helpers\ChatMessageHelper;
use App\Helpers\CoinFormatter;
use App\Helpers\RatingHelper;
use App\Helpers\SettingsHelper;
use App\Models\BrandSetting;
use App\Models\Coin;
use App\Models\MarketplaceOffer;
use App\Models\MarketplaceSetting;
use App\Models\MarketplaceTrade;
use App\Models\NotificationSetting;
use App\Models\PageSetting;
use App\Models\TemplateSetting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

include 'Authentication/functions.php';

if (!function_exists('coin')) {
	/**
	 * Instance of coin formatter class.
	 *
	 * @param mixed $amount
	 * @param Coin $coin
	 * @param bool $convertToBase
	 * @return CoinFormatter
	 */
	function coin($amount, Coin $coin, $convertToBase = false)
	{
		return new CoinFormatter($amount, $coin, $convertToBase);
	}
}

if (!function_exists('paginateResult')) {
	/**
	 * @param Model|Builder|\Illuminate\Database\Query\Builder $query
	 * @param array $filters
	 * @param $itemPerPage
	 * @param $page
	 * @return mixed
	 */
	function paginateResult($query, int $itemPerPage, int $page, $filters = [])
	{
		if ($filters && is_array($filters)) {
			foreach ($filters as $column => $value) {
				if (empty($value)) continue;

				if (is_string($value)) {
					$query->where($column, "like", "%{$value}%");
				}

				if (is_array($value)) {
					$query->whereIn($column, $value);
				}
			}
		}

		return $query->paginate($itemPerPage, ['*'], 'page', $page);
	}
}

if (!function_exists('paginateCollection')) {
	/**
	 * @param Collection $collection
	 * @param $itemPerPage
	 * @param $page
	 * @param array $filters
	 * @return mixed
	 */
	function paginateCollection($collection, $itemPerPage, $page, $filters = [])
	{
		if ($filters && is_array($filters)) {
			foreach ($filters as $column => $value) {
				if (empty($value)) continue;

				$collection = $collection->filter(function ($record) use ($column, $value) {
					return Str::contains($record->$column, $value);
				});
			}
		}
		return paginate($collection, $itemPerPage, $page);
	}
}

if (!function_exists('settings')) {
	/**
	 * @param null $type
	 * @return SettingsHelper|NotificationSetting|TemplateSetting|MarketplaceSetting|BrandSetting|PageSetting|mixed
	 */
	function settings($type = null)
	{
		$helper = resolve(SettingsHelper::class);

		switch ($type) {
			case 'template':
				return $helper->template();

			case 'notification':
				return $helper->notification();

			case 'brand':
				return $helper->brand();

			case 'marketplace':
				return $helper->marketplace();

			case 'page':
				return $helper->page();

			default:
				return $helper;
		}
	}
}

if (!function_exists('paginate')) {
	/**
	 * Paginate collection
	 *
	 * @param $items
	 * @param int $perPage
	 * @param null $page
	 * @param array $options
	 * @return LengthAwarePaginator
	 */
	function paginate($items, $perPage = 15, $page = null, $options = [])
	{
		$options = array_merge($options, ['path' => Paginator::resolveCurrentPath()]);
		$page = $page ?: (Paginator::resolveCurrentPage() ?: 1);
		$items = $items instanceof Collection ? $items : collect($items);

		return new LengthAwarePaginator(
			$items->forPage($page, $perPage), $items->count(), $perPage, $page, $options
		);
	}
}

if (!function_exists('rating')) {
	/**
	 * Create new rating
	 *
	 * @return RatingHelper
	 */
	function rating()
	{
		return new RatingHelper();
	}
}

if (!function_exists('getVisibleMarketplaceOffers')) {
	/**
	 * Get visible marketplace offers
	 *
	 * @return Collection
	 */
	function getVisibleMarketplaceOffers()
	{
		if (Auth::user()) {
			return Auth::user()->visibleMarketplaceOffers();
		}

		$period = settings('marketplace')->offer_cache_period;
		$expiresAt = now()->addMinutes($period);
		$key = 'public.visible-marketplace-offers';

		return Cache::store('file')
			->remember($key, $expiresAt, function () {
				return MarketplaceOffer::where('status', true)
					->has('walletAccount.user')->get()
					->filter(function (MarketplaceOffer $offer) {
						return $offer->filterByGuest();
					})->values();
			});
	}
}

if (!function_exists('getAvatarPath')) {
	/**
	 * @param $user
	 * @param $name
	 * @return string
	 */
	function getAvatarPath($user, $name)
	{
		return storage_path("users/{$user->id}/picture/{$name}");
	}
}

if (!function_exists('getSmsChannel')) {
	/**
	 * @return mixed
	 */
	function getSmsChannel()
	{
		$provider = config()->get('notifications.defaults.sms');

		return config()->get("notifications.sms.{$provider}.channel");
	}
}

if (!function_exists('rand_int')) {
	/**
	 * Generate random integer
	 *
	 * @param int $digits
	 * @return int
	 */
	function rand_int(int $digits)
	{
		$number = "";
		$i = 0;

		while ($i < $digits) {
			$number .= mt_rand(0, 9);
			$i++;
		}

		return (int) $number;
	}
}

if (!function_exists('chatMessage')) {
	/**
	 * ChatMessage Helper
	 *
	 * @param string $type
	 * @return ChatMessageHelper
	 * @throws Exception
	 */
	function chatMessage(string $type)
	{
		return new ChatMessageHelper($type);
	}
}

if (!function_exists('getTradeChatParameters')) {
	/**
	 * Get trade chat parameters
	 *
	 * @param MarketplaceTrade $trade
	 * @return array
	 */
	function getTradeChatParameters(MarketplaceTrade $trade)
	{
		return [
			'trade_id' => $trade->id
		];
	}
}