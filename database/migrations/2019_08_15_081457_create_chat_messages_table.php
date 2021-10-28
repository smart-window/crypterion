<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_messages', function (Blueprint $table) {
	        $table->string('id')->primary();

	        $table->string('chat_id');
	        $table->foreign('chat_id')->references('id')
		        ->on('chats')->onDelete('cascade');

	        $table->bigInteger('user_id')->nullable()->unsigned();
	        $table->foreign('user_id')->references('id')
		        ->on('users')->onDelete('set null');

	        $table->enum('type', ['text', 'attachment', 'activity'])
		        ->default('text');

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
        Schema::dropIfExists('chat_messages');
    }
}
