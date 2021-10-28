<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateRatingsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->bigIncrements('id');

	        $table->string('subject_id');
	        $table->string('subject_type');

	        $table->string('rater_id');
	        $table->string('rater_type');

	        $table->text('comment')->nullable();
            $table->integer('rating');

	        $table->string('rateable_id');
	        $table->string('rateable_type');

	        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::drop('ratings');
    }
}
