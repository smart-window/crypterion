<?php

namespace App\Console\Commands;

use App\Models\Wallet;
use Illuminate\Console\Command;

class ShowCoinPassphrase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'coin:show-passphrase';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show coin passphrase';

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
        $body = Wallet::all()
            ->map(function (Wallet $wallet) {
                return [
                    'name'       => $wallet->coin->name,
                    'passphrase' => $wallet->passphrase,
                ];
            })->toArray();

        $this->table(['Name', 'Passphrase'], $body);
    }
}
