<?php

namespace App\Listeners;

use App\Events\UserPictureChanged;

class LogPictureChangeActivity
{
    /**
     * Handle the event.
     *
     * @param  UserPictureChanged  $event
     * @return void
     */
    public function handle(UserPictureChanged $event)
    {
	    $event->user->logActivity('Changed Picture', $event->agent, $event->ip);
    }
}
