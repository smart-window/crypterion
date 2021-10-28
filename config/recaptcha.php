<?php

return [
	'enable'  => env('GOOGLE_RECAPTCHA_ENABLE', false),
	'secret'  => env('GOOGLE_RECAPTCHA_SECRET', "SECRET"),
	'sitekey' => env('GOOGLE_RECAPTCHA_SITEKEY', "SITEKEY"),
	'type'    => env('GOOGLE_RECAPTCHA_TYPE', 'normal')
];