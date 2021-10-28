<?php

namespace App\Console\Commands;

use App\Events\UserPresenceChanged;
use App\Models\User;
use Illuminate\Console\Command;

class UpdateOfflineUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:update-offline';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set users which last seen is a long time ago to offline';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
	    $lifetime = config('session.lifetime');
	    $users = User::whereIn('presence', ['online', 'away'])->get();

	    $users->each(function (User $user) use ($lifetime) {
		    if ($user->last_seen_at == null || now()->diffInMinutes($user->last_seen_at) > $lifetime) {
		    	$user->update(['presence' => 'offline']);

			    broadcast(new UserPresenceChanged($user));

			    $this->info("Updated {$user->name}'s presence as offline");
		    }
	    });
    }
}
