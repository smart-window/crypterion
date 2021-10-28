<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWalletsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->integer('min_confirmations')->default(3);
	        $table->string('source_id');
	        $table->string('label')->nullable();
            $table->text('passphrase');
            $table->bigInteger('coin_id')->unsigned();
            $table->foreign('coin_id')->references('id')
	            ->on('coins')->onDelete('cascade');
	        $table->double('marketplace_fee')->default(1);
	        $table->text('data')->nullable();
	        $table->boolean('pending')->default(false);
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
        Schema::dropIfExists('wallets');
    }
}
