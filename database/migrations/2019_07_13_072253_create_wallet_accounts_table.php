<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWalletAccountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallet_accounts', function (Blueprint $table) {
            $table->bigIncrements('id');

	        $table->bigInteger('wallet_id')->unsigned();
	        $table->foreign('wallet_id')->references('id')
		        ->on('wallets')->onDelete('cascade');

	        $table->bigInteger('user_id')->unsigned();
	        $table->foreign('user_id')->references('id')
		        ->on('users')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wallet_accounts');
    }
}
