<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserTwoFactorSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_two_factor_settings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->boolean('enabled')->default(false);
            $table->boolean('authentication')->default(false);
	        $table->boolean('outgoing_transfer')->default(true);
	        $table->boolean('marketplace')->default(true);
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
        Schema::dropIfExists('user_two_factor_settings');
    }
}
