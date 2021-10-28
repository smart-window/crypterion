<?php
/**
 * ======================================================================================================
 * File Name: Rateable.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 8/27/2019 (6:52 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Models\Traits;

use App\Models\Rating;
use Illuminate\Database\Eloquent\Builder;

trait Rateable
{
	/**
	 * @return Builder
	 */
	public function ratings()
	{
		return $this->morphMany(Rating::class, 'rateable');
	}

	/**
	 * @return float
	 */
	public function averageRating()
	{
		return round($this->ratings()->avg('rating'), 1);
	}

	/**
	 * @return float
	 */
	public function sumRating()
	{
		return $this->ratings()->sum('rating');
	}

	/**
	 * @param int $max
	 * @return float|int
	 */
	public function ratingPercent($max = 5)
	{
		$quantity = $this->ratings()->count();
		$total = $this->sumRating();

		return ($quantity * $max) > 0 ? $total / (($quantity * $max) / 100) : 0;
	}

	/**
	 * @return mixed
	 */
	public function getAverageRatingAttribute()
	{
		return $this->averageRating();
	}

	/**
	 * @return mixed
	 */
	public function getSumRatingAttribute()
	{
		return $this->sumRating();
	}
}