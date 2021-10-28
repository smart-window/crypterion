<?php

return [
	'env'         => env('BITGO_ENV', 'test'),
	'token'       => env('BITGO_TOKEN'),
	'host'        => env('BITGO_HOST'),
	'port'        => env('BITGO_PORT'),
	'fee_percent' => env('BITGO_FEE_PERCENT', 0.01)
];