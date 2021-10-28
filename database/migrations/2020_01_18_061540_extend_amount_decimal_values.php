<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ExtendAmountDecimalValues extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 * @throws \Doctrine\DBAL\DBALException
	 */
	public function up()
	{
		Schema::getConnection()->getDoctrineSchemaManager()
			->getDatabasePlatform()
			->registerDoctrineTypeMapping('enum', 'string');

		Schema::table('coins', function (Blueprint $table) {
			$table->decimal('base_unit', 36, 0)->change();
		});

		Schema::table('wallet_transactions', function (Blueprint $table) {
			$table->decimal('value', 36, 0)->change();
		});

		Schema::table('transfer_records', function (Blueprint $table) {
			$table->decimal('value', 36, 0)->change();
		});

		Schema::table('marketplace_trades', function (Blueprint $table) {
			$table->decimal('fee', 36, 0)->change();
			$table->decimal('amount', 36, 0)->default(0)->change();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 * @throws \Doctrine\DBAL\DBALException
	 */
	public function down()
	{
		Schema::getConnection()->getDoctrineSchemaManager()
			->getDatabasePlatform()
			->registerDoctrineTypeMapping('enum', 'string');

		Schema::table('coins', function (Blueprint $table) {
			$table->decimal('base_unit', 36, 18)->change();
		});

		Schema::table('wallet_transactions', function (Blueprint $table) {
			$table->decimal('value', 36, 18)->change();
		});

		Schema::table('transfer_records', function (Blueprint $table) {
			$table->decimal('value', 36, 18)->change();
		});

		Schema::table('marketplace_trades', function (Blueprint $table) {
			$table->decimal('fee', 36, 18)->change();
			$table->decimal('amount', 36, 18)->default(0)->change();
		});
	}
}
