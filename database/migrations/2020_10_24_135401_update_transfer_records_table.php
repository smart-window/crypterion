<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateTransferRecordsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('transfer_records', function (Blueprint $table) {
            $table->bigInteger('balance')->default(0);
            $table->bigInteger('balance_on_trade')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('transfer_records', function (Blueprint $table) {
            $table->dropColumn('balance');
            $table->dropColumn('balance_on_trade');
        });
    }
}
