<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMarketplaceSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('marketplace_settings', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->double('min_offer_amount');
	        $table->integer('offer_cache_period')->default(5);
	        $table->double('max_offer_amount');
	        $table->string('branch');
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
        Schema::dropIfExists('marketplace_settings');
    }
}
