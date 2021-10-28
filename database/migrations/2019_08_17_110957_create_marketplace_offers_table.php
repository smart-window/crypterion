<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMarketplaceOffersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('marketplace_offers', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->enum('type', ['buy', 'sell']);

	        $table->bigInteger('wallet_account_id')->unsigned();
	        $table->foreign('wallet_account_id')->references('id')
		        ->on('wallet_accounts')->onDelete('cascade');

	        $table->bigInteger('payment_method_id')->unsigned()->nullable();
	        $table->foreign('payment_method_id')->references('id')
		        ->on('payment_methods')->onDelete('cascade');

	        $table->bigInteger('user_id')->unsigned();
	        $table->foreign('user_id')->references('id')
		        ->on('users')->onDelete('cascade');

	        $table->string('currency');
	        $table->boolean('status')->default(true);
	        $table->double('min_amount');
	        $table->double('max_amount')->nullable();
	        $table->double('profit_margin');
	        $table->string('country', 10)->nullable();
	        $table->string('privacy')->nullable();
	        $table->integer('confirmation_time_frame');
	        $table->boolean('require_phone_verification')->default(false);
	        $table->boolean('require_email_verification')->default(false);
	        $table->text('tags')->nullable();
	        $table->string('label')->nullable();
	        $table->text('terms')->nullable();
	        $table->text('instructions')->nullable();
	        $table->string('slug');
	        $table->text('filter_users')->nullable();

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
        Schema::dropIfExists('marketplace_offers');
    }
}
