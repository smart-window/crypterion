<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
	    $this->call(PermissionsTableSeeder::class);
	    $this->call(UsersTableSeeder::class);
	    $this->call(PaymentMethodsSeeder::class);
	    $this->call(TagsTableSeeder::class);
	    $this->call(WidgetsTableSeeder::class);
    }
}
