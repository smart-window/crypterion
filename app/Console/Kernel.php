<?php

namespace App\Console;

use App\Models\NotificationTemplate;
use App\Models\TemplateSetting;
use Exception;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Cache;
use JSsVPSDioNXpfRC;
use Symfony\Component\Debug\Exception\FatalThrowableError;
use Throwable;

class Kernel extends ConsoleKernel
{
	/**
	 * The Artisan commands provided by your application.
	 *
	 * @var array
	 */
	protected $commands = [
		//
	];

	/**
	 * The commands that requires license for execution.
	 *
	 * @var array
	 */
	protected $licensed = [
		'migrate'
	];

	/**
	 * Run the console application.
	 *
	 * @param \Symfony\Component\Console\Input\InputInterface $input
	 * @param \Symfony\Component\Console\Output\OutputInterface|null $output
	 * @return int
	 * @throws \Psr\SimpleCache\InvalidArgumentException
	 */
	public function handle($input, $output = null)
	{
		$this->bootstrap();
		try {
			$arg = $input->getFirstArgument();
			$crypterion = $this->resolveCrypterion();

			foreach ($this->licensed as $pattern) {
				if (strpos($arg, $pattern) !== false) {
					if (!$crypterion->license()->isValid()) {
						throw new Exception("You need a valid license to proceed.");
					}
				}
			}

			return parent::handle($input, $output);
		} catch (Exception $e) {
			return $output->writeln($e->getMessage());
		} catch (Throwable $e) {
			$e = new FatalThrowableError($e);

			$this->reportException($e);
			$this->renderException($output, $e);
			return 1;
		}
	}

	/**
	 * Resolve crypterion
	 *
	 * @return mixed|JSsVPSDioNXpfRC
	 */
	protected function resolveCrypterion()
	{
		$crypterion = resolve('crypterion');

		if (!is_subclass_of($crypterion, 'JSsVPSDioNXpfRC')) {
			return app()->abort(500, 'Corrupted filesystem.');
		} else {
			return $crypterion;
		}
	}
	/**
	 * Define the application's command schedule.
	 *
	 * @param \Illuminate\Console\Scheduling\Schedule $schedule
	 * @return void
	 */
	protected function schedule(Schedule $schedule)
	{
		if (config()->get('currency.api_key')) {
			$schedule->command('currency:update')
				->daily();
		}

		if (app()->bound('debugbar')) {
			$schedule->command('debugbar:clear')
				->hourly();
		}

        $schedule->command('pending-approvals:process')
            ->everyMinute()
            ->runInBackground();

		$schedule->command('wallet-transactions:process')
			->everyMinute()
			->runInBackground();

		if (config('queue.schedule')) {
			$schedule->command('queue:work', [
				'--tries' => 1, '--stop-when-empty'
			])
				->everyMinute()
				->runInBackground();
		}

		$schedule->command('users:update-offline')
			->everyMinute()
			->withoutOverlapping();

		$schedule->command('users:deactivate-scheduled')
			->everyMinute()
			->withoutOverlapping();

		$schedule->command('trades:cancel-expired')
			->everyMinute()
			->withoutOverlapping();

		$schedule->command('users:delete-scheduled')
			->everyMinute()
			->withoutOverlapping();

		$schedule->command('geoip:update')->monthly()
			->withoutOverlapping()
			->runInBackground();

		$schedule->call(function(){
			Cache::forever('cron.timestamp', now());
		})->everyMinute();

		if (config('app.live_preview')) {
			$schedule->call(function(){
				TemplateSetting::query()->delete();
				NotificationTemplate::query()->delete();
			})->twiceDaily();
		}
	}

	/**
	 * Register the commands for the application.
	 *
	 * @return void
	 */
	protected function commands()
	{
		$this->load(__DIR__ . '/Commands');

		require base_path('routes/console.php');
	}
}
