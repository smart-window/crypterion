<?php

use Illuminate\Database\Seeder;

class PaymentMethodsSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
//		if (!PaymentMethodCategory::count()) {
//			// Gift Cards
//			$category = PaymentMethodCategory::create([
//				'name'        => 'Gift Cards',
//				'description' => 'All gift cards payment method!'
//			]);
//
//			$paymentMethods = [
//				[
//					'name'        => 'iTunes Gift Card',
//					'description' => 'Buy coin with iTunes gift card.',
//				],
//				[
//					'name'        => 'Walmart Gift Card',
//					'description' => 'Buy coin with Walmart gift card.',
//				]
//			];
//
//			foreach ($paymentMethods as $method) {
//				$category->paymentMethods()->create($method);
//			}
//
//			// Debit/Credit Cards
//			$category = PaymentMethodCategory::create([
//				'name'        => 'Debit/Credit Cards',
//				'description' => 'All debit cards payment method!'
//			]);
//
//			$paymentMethods = [
//				[
//					'name'        => 'My Vanilla Prepaid Debit Card',
//					'description' => 'Buy coin with Vanilla Prepaid Debit card.',
//				],
//				[
//					'name'        => 'Prepaid Debit Card',
//					'description' => 'Buy coin with Prepaid Debit Card.',
//				],
//			];
//
//			foreach ($paymentMethods as $method) {
//				$category->paymentMethods()->create($method);
//			}
//		}
	}
}
