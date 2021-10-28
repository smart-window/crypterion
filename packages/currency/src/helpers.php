<?php

if (!function_exists('currency')) {
    /**
     * Convert given number.
     *
     * @param float  $amount
     * @param string $from
     * @param string $to
     * @param bool   $format
     *
     * @return \HolluwaTosin360\Currency\Currency|string
     */
    function currency($amount = null, $from = null, $to = null, $format = false)
    {
        if (is_null($amount)) {
            return app('currency');
        }

        return app('currency')->convert($amount, $from, $to, $format);
    }
}


if (!function_exists('currency_format')) {
	/**
	 * Format given number.
	 *
	 * @param float $amount
	 * @param $code
	 * @param bool $include_symbol
	 * @return \HolluwaTosin360\Currency\Currency|string
	 */
    function currency_format($amount, $code, $include_symbol = true)
    {
        return app('currency')->format($amount, $code, $include_symbol);
    }
}

