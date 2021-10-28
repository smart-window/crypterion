<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\Auth\UserDeleted;
use Illuminate\Console\Command;

class DeleteScheduledUsers extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'users:delete-scheduled';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Command description';

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
		User::whereNotNull('scheduled_delete')
			->get()->each(function (User $user) {
				if ($user->canBeDeleted()) {
					$user->update(['scheduled_delete' => null]);

					$user->delete();
					$user->notify(new UserDeleted());

					$this->info("Deleted {$user->name}");
				}
			});
	}
}
