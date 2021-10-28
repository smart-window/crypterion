<?php

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        if(env('LIVE_PREVIEW', false)){
            $user = User::updateOrCreate([
                'name'     => 'SuperAdmin',
            ], [
                'email'    => 'SuperAdmin@gmail.com',
                'password' => bcrypt(12345678),
            ]);
            $role = config('permission.super_admin_role');
            $user->assignRole($role);
        }
    }
}
