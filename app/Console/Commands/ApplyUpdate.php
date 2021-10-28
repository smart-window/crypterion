<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ApplyUpdate extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'update:apply';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'This will run database migrations and seeds';

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
		$this->info("This action will run all necessary database migrations and seeds for this update.");
		$this->info("We STRONGLY recommend that you make a FULL BACKUP of the database before you proceed.");

		if ($this->confirm("Are you SURE you want to continue?")) {
			$this->call('queue:restart');
			$this->call('migrate', ['--force' => true]);
			$this->call('db:seed', ['--force' => true]);
		}
	}
}
