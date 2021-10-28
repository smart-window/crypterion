<?php

use App\Channels\AfricasTalkingChannel;
use App\Channels\TwilioChannel;

return [
	'defaults' => [
		'sms' => env('SMS_PROVIDER', 'nexmo')
	],

	'sms' => [
		'nexmo' => [
			'channel' => 'nexmo'
		],

		'africastalking' => [
			'channel' => AfricasTalkingChannel::class
		],

		'twilio' => [
			'channel' => TwilioChannel::class
		],

		// 'msg91' => [
		//     'channel' => \App\Channels\Msg91Channel::class
		// ],
	],

	'settings' => [
		'wallet_confirmed_receive' => [
			'email'    => true,
			'database' => true,
			'sms'      => true,
		],

		'wallet_unconfirmed_receive' => [
			'email'    => true,
			'database' => true,
			'sms'      => null,
		],

		'marketplace_trade_started' => [
			'email'    => true,
			'database' => true,
			'sms'      => true,
		],

		'marketplace_trade_marked_as_paid' => [
			'email'    => true,
			'database' => true,
			'sms'      => true,
		],

		'marketplace_trade_cancelled_or_expired' => [
			'email'    => true,
			'database' => true,
			'sms'      => null,
		],

        'marketplace_trade_received_rating' => [
            'email'    => true,
            'database' => true,
            'sms'      => null,
        ]
	],
];
