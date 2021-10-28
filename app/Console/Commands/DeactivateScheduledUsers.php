<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\Auth\UserDeactivated;
use Illuminate\Console\Command;

class DeactivateScheduledUsers extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'users:deactivate-scheduled';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Deactivate scheduled users';

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
		User::whereNotNull('scheduled_deactivate')
			->get()->each(function (User $user) {
				if ($user->canBeDeactivated()) {
					$inactiveUntil = $user->scheduled_deactivate;

					$user->update([
						'scheduled_deactivate' => null,
						'inactive_until'       => $inactiveUntil,
					]);

					$user->notify(new UserDeactivated());

					$this->info("Deactivated {$user->name}");
				}
			});
	}
}
