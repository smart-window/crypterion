<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMarketplaceChargesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('marketplace_charges', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->string('description')->nullable();

	        $table->bigInteger('wallet_account_id')->unsigned();
	        $table->foreign('wallet_account_id')->references('id')
		        ->on('wallet_accounts')->onDelete('cascade');

	        $table->double('dollar_amount');
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
        Schema::dropIfExists('marketplace_charges');
    }
}
