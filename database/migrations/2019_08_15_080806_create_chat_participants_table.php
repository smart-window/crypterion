<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatParticipantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_participants', function (Blueprint $table) {
            $table->bigIncrements('id');

	        $table->timestamp('last_read_at')->nullable();

	        $table->string('chat_id');
	        $table->foreign('chat_id')->references('id')
		        ->on('chats')->onDelete('cascade');

	        $table->bigInteger('user_id')->nullable()->unsigned();
	        $table->foreign('user_id')->references('id')
		        ->on('users')->onDelete('set null');

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
        Schema::dropIfExists('chat_participants');
    }
}
