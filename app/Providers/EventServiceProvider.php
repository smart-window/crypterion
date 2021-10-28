<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
	    'App\Events\UserLoggedIn' => [
		    'App\Listeners\LogLoginActivity',
	    ],

	    'App\Events\UserPictureChanged' => [
		    'App\Listeners\LogPictureChangeActivity',
	    ],

	    'Illuminate\Notifications\Events\NotificationSent' => [
		    'App\Listeners\NotificationSentListener',
	    ],

	    'App\Events\UserRegistered' => [
	        'App\Listeners\LogRegisterActivity',
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();
    }
}
