<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatMessageActivitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_message_activities', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->string('type');
	        $table->text('parameters')->nullable();

	        $table->string('message_id');
	        $table->foreign('message_id')->references('id')
		        ->on('chat_messages')->onDelete('cascade');

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
        Schema::dropIfExists('chat_message_activities');
    }
}
