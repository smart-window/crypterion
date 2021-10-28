<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransferRecordsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transfer_records', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->bigInteger('value');

	        $table->bigInteger('wallet_account_id')->unsigned();
	        $table->foreign('wallet_account_id')->references('id')
		        ->on('wallet_accounts')->onDelete('cascade');

	        $table->bigInteger('receiver_wallet_address_id')->unsigned()->nullable();
	        $table->foreign('receiver_wallet_address_id')->references('id')
		        ->on('wallet_addresses')->onDelete('set null');

	        $table->bigInteger('wallet_transaction_id')->unsigned()->nullable();
	        $table->foreign('wallet_transaction_id')->references('id')
		        ->on('wallet_transactions')->onDelete('cascade');

	        $table->string('description')->nullable();
	        $table->integer('confirmations')->default(0);
	        $table->integer('required_confirmations')->default(0);
	        $table->double('dollar_price');
	        $table->enum('type', ['send', 'receive']);

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
        Schema::dropIfExists('transfer_records');
    }
}
