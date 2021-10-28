<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFeesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->bigIncrements('id');

	        $table->bigInteger('wallet_id')->unsigned()->nullable();
	        $table->foreign('wallet_id')->references('id')
		        ->on('wallets')->onDelete('cascade');

	        $table->bigInteger('payment_method_id')->unsigned()->nullable();
	        $table->foreign('payment_method_id')->references('id')
		        ->on('payment_methods')->onDelete('cascade');

	        $table->double('marketplace_fee')->nullable();
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
        Schema::dropIfExists('fees');
    }
}
