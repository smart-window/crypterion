<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use Illuminate\Contracts\Queue\ShouldQueue;

class LogRegisterActivity implements ShouldQueue
{
	/**
     * Handle the event.
     *
     * @param  UserRegistered  $event
     * @return void
     */
    public function handle(UserRegistered $event)
    {
	    $event->user->logActivity('Registered', $event->agent, $event->ip);
    }
}
