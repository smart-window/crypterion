<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Lang;

class Widget extends Model
{
	/**
	 * The attributes that aren't mass assignable.
	 *
	 * @var array
	 */
	protected $guarded = [];

	/**
	 * The attributes that should be cast to native types.
	 *
	 * @var array
	 */
	protected $casts = [
		'dimensions' => 'array',
		'enabled'    => 'boolean',
		'resizable'  => 'boolean',
	];

	/**
	 * The accessors to append to the model's array form.
	 *
	 * @var array
	 */
	protected $appends = [
		'title'
	];

	/**
	 * The title attribute for this template
	 *
	 * @return array|mixed|string|null
	 */
	protected function getTitleAttribute()
	{
		return Lang::trans($this->getTransKey());
	}

	/**
	 * Get translation key for this template's title
	 *
	 * @return string
	 */
	protected function getTransKey()
	{
		return "widget.{$this->name}";
	}
}
