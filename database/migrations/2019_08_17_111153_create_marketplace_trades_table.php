<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMarketplaceTradesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('marketplace_trades', function (Blueprint $table) {
	        $table->string('id')->primary();

	        $table->bigInteger('buyer_id')->unsigned();
	        $table->foreign('buyer_id')->references('id')
		        ->on('users')->onDelete('cascade');

	        $table->bigInteger('seller_id')->unsigned();
	        $table->foreign('seller_id')->references('id')
		        ->on('users')->onDelete('cascade');

	        $table->string('chat_id')->nullable();
	        $table->foreign('chat_id')->references('id')
		        ->on('chats')->onDelete('set null');

	        $table->bigInteger('wallet_account_id')->unsigned();
	        $table->foreign('wallet_account_id')->references('id')
		        ->on('wallet_accounts')->onDelete('cascade');

	        $table->bigInteger('offer_id')->unsigned()->nullable();
	        $table->foreign('offer_id')->references('id')
		        ->on('marketplace_offers')->onDelete('set null');

	        $table->text('payment_method_name');
	        $table->text('payment_method_description');
	        $table->string('currency');
	        $table->string('country')->nullable();
	        $table->double('offer_amount');
	        $table->bigInteger('fee');
	        $table->bigInteger('amount')->default(0);
	        $table->double('dollar_price');
	        $table->text('terms')->nullable();
	        $table->text('instructions')->nullable();
	        $table->string('label')->nullable();

	        $table->bigInteger('dispute_by')->unsigned()->nullable();
	        $table->foreign('dispute_by')->references('id')
		        ->on('users')->onDelete('set null');

	        $table->text('dispute_comment')->nullable();
	        $table->dateTime('confirmed_at')->nullable();
	        $table->dateTime('cancels_at');

	        $table->enum('status', [
		        'active', 'successful', 'cancelled', 'dispute'
	        ])->default('active');

	        $table->boolean('seller_rateable')->default(true);
	        $table->boolean('buyer_rateable')->default(true);

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
        Schema::dropIfExists('marketplace_trades');
    }
}
