<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWalletTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->string('source_id');
	        $table->string('hash')->unique();
	        $table->dateTime('date');
	        $table->enum('type', ["send", "receive"]);

	        $table->bigInteger('wallet_id')->unsigned();
	        $table->foreign('wallet_id')->references('id')
		        ->on('wallets')->onDelete('cascade');

	        $table->bigInteger('value');
	        $table->text('input')->nullable();
	        $table->text('output')->nullable();

	        $table->integer('confirmations')->default(0);
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
        Schema::dropIfExists('wallet_transactions');
    }
}
