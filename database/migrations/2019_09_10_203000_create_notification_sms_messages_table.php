<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationSmsMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('notification_sms_messages', function (Blueprint $table) {
            $table->bigIncrements('id');

	        $table->string('locale');

	        $table->bigInteger('template_id')->unsigned();
	        $table->foreign('template_id')->references('id')
		        ->on('notification_templates')->onDelete('cascade');

	        $table->text('content')->nullable();

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
        Schema::dropIfExists('notification_sms_messages');
    }
}
