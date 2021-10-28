<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
	        $table->string('name')->unique();
	        $table->string('phone')->nullable();
	        $table->string('email')->unique();

	        $table->dateTime('phone_verified_at')->nullable();
	        $table->dateTime('email_verified_at')->nullable();

	        $table->string('password');
	        $table->string('currency')->nullable();
	        $table->text('two_factor_secret');
	        $table->dateTime('inactive_until')->nullable();

	        $table->enum('presence', ['online', 'away', 'offline'])
		        ->default('offline');

	        $table->dateTime('scheduled_deactivate')->nullable();
	        $table->boolean('scheduled_delete')->nullable();

	        $table->timestamp('notifications_read_at')->nullable();
	        $table->timestamp('last_seen_at')->nullable();
	        $table->timestamp('last_login_at')->nullable();

	        $table->softDeletes();
	        $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
}
