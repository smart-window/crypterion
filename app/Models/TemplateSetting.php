<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use JSsVPSDioNXpfRC;

class TemplateSetting extends Model
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
		'color_palettes' => 'array',
	];

	/**
	 * Boot the Model.
	 */
	public static function boot()
	{
		parent::boot();

		$crypterion = static::resolveCrypterion();

		static::updating(function ($settings) use ($crypterion) {
			if (!$crypterion->license()->isExtended()) {
				return app()->abort(402, 'Your license is not supported for this');
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
}
