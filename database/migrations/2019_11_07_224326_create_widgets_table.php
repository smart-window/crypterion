<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWidgetsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('widgets', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->string('category');
	        $table->string('name');
	        $table->text('dimensions')->nullable();
	        $table->boolean('enabled')->default(true);
	        $table->boolean('resizable')->default(true);
	        $table->integer('order')->default(1);
            $table->unsignedTinyInteger('min_cols')->nullable();
            $table->unsignedTinyInteger('max_cols')->nullable();
	        $table->unsignedTinyInteger('cols');
            $table->unsignedTinyInteger('min_rows')->nullable();
            $table->unsignedTinyInteger('max_rows')->nullable();
	        $table->unsignedTinyInteger('rows');
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
        Schema::dropIfExists('widgets');
    }
}
