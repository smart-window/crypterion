<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatMessageAttachmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_message_attachments', function (Blueprint $table) {
            $table->bigIncrements('id');

	        $table->string('hash_name');
	        $table->string('name');
	        $table->bigInteger('size');
	        $table->string('caption')->nullable();
	        $table->string('mime_type');

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
        Schema::dropIfExists('chat_message_attachments');
    }
}
