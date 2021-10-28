<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePendingApprovalsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pending_approvals', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('source_id');
            $table->string('state');
            $table->mediumText('info');
            $table->string('scope');
            $table->mediumText('data')->nullable();

            $table->bigInteger('transfer_record_id')->unsigned()->nullable();
            $table->foreign('transfer_record_id')->references('id')
                ->on('transfer_records')->onDelete('cascade');

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
        Schema::dropIfExists('pending_approvals');
    }
}
