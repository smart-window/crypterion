<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BrandSetting extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * Format url with protocol
	 *
	 * @param $value
	 * @return \Illuminate\Contracts\Routing\UrlGenerator|string
	 */
	public function getFaviconUrlAttribute($value)
	{
		return $value ? url($value) : null;
	}

	/**
	 * Format url with protocol
	 *
	 * @param $value
	 * @return \Illuminate\Contracts\Routing\UrlGenerator|string
	 */
	public function getLogoDarkUrlAttribute($value)
	{
		return $value ? url($value) : null;
	}

	/**
	 * Format url with protocol
	 *
	 * @param $value
	 * @return \Illuminate\Contracts\Routing\UrlGenerator|string
	 */
	public function getLogoUrlAttribute($value)
	{
		return $value ? url($value) : null;
	}

	/**
	 * Format url with protocol
	 *
	 * @param $value
	 * @return \Illuminate\Contracts\Routing\UrlGenerator|string
	 */
	public function getLogoIconUrlAttribute($value)
	{
		return $value ? url($value) : null;
	}
}
