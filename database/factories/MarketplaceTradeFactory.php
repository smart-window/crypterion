<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\MarketplaceTrade;
use Faker\Generator as Faker;

$factory->define(MarketplaceTrade::class, function (Faker $faker) {
	return [
		"buyer_id"          => 1,
		"seller_id"         => 2,
		"wallet_account_id" => 0,
		"offer_id"          => $faker->uuid,
		"chat_id"           => $faker->uuid,
		"currency"          => $faker->currencyCode,
		"country"           => $faker->countryCode,
		"offer_amount"      => $faker->numberBetween(100, 10000),
		"fee"               => $faker->numberBetween(100, 10000),
		"amount"            => $faker->numberBetween(100, 10000),
		"dollar_price"      => $faker->numberBetween(100, 10000),
		"terms"             => $faker->realText(),
		"instructions"      => $faker->realText(),
		"label"             => $faker->realText(),
		"dispute_by"        => 2,
		"cancels_at"        => $faker->dateTime,
		"confirmed_at"      => $faker->dateTime,
		"status"            => "active",
	];
});
