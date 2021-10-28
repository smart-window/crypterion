<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWalletAddressesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallet_addresses', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->string('source_id');
	        $table->string('address')->unique();
	        $table->string('label')->nullable();

	        $table->bigInteger('wallet_id')->unsigned();
	        $table->foreign('wallet_id')->references('id')
		        ->on('wallets')->onDelete('cascade');

	        $table->bigInteger('wallet_account_id')->unsigned();
	        $table->foreign('wallet_account_id')->references('id')
		        ->on('wallet_accounts')->onDelete('cascade');

	        $table->boolean('pending')->default(false);
	        $table->text('data')->nullable();

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
        Schema::dropIfExists('wallet_addresses');
    }
}
