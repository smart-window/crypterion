<?php

namespace App\Console\Commands;

use App\Models\MarketplaceTrade;
use App\Notifications\Marketplace\TradeCancelled;
use Illuminate\Console\Command;

class CancelExpiredTrades extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'trades:cancel-expired';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Cancel all expired trade';

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
		MarketplaceTrade::with('buyer')
			->where('status', 'active')->has('buyer')->has('seller')
			->with('buyer')->whereNull('confirmed_at')
			->where('cancels_at', '<', now())
			->get()->each(function (MarketplaceTrade $trade) {
				$trade->update(['status' => 'cancelled']);

				chatMessage('activity')
					->content([
						'type'       => 'marketplace_trade_cancelled',
						'parameters' => getTradeChatParameters($trade)
					])
					->by($trade->buyer)
					->save($trade->chat);

				$trade->seller->notify(new TradeCancelled($trade));
				$trade->buyer->notify(new TradeCancelled($trade));

				$this->info("Cancelled Trade: {$trade->id}");
			});
	}
}
