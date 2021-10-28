<?php

use App\Rules\ValidateRecaptcha;
use Illuminate\Validation\Rule;

if (!function_exists('getAuthUsername')) {
	/**
	 * @param string $default
	 * @return bool
	 */
	function getAuthUsername($default = 'email')
	{
		$allowed = ['name', 'email'];
		$column = config('auth.username');
		return in_array($column, $allowed) ?
			$column : $default;
	}
}

if (!function_exists('getRecaptchaRules')) {
	/**
	 * Get recaptcha rules
	 *
	 * @return mixed
	 */
	function getRecaptchaRules()
	{
		return [
			Rule::requiredIf(function () {
				return (bool) config()->get('recaptcha.enable');
			}),
			new ValidateRecaptcha
		];
	}
}