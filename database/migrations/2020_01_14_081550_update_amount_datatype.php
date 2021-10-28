<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateAmountDatatype extends Migration
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
		    $table->bigInteger('base_unit')->change();
	    });

	    Schema::table('wallet_transactions', function (Blueprint $table) {
		    $table->bigInteger('value')->change();
	    });

	    Schema::table('transfer_records', function (Blueprint $table) {
		    $table->bigInteger('value')->change();
	    });

	    Schema::table('marketplace_trades', function (Blueprint $table) {
		    $table->bigInteger('fee')->change();
		    $table->bigInteger('amount')->default(0)->change();
	    });
    }
}
