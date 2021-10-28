<?php

namespace App\Console\Commands;

use App\Adapters\Coin\Resources\PendingApproval;
use App\Jobs\ProcessPendingApproval;
use App\Models\Coin;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class ProcessPendingApprovals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pending-approvals:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending approvals';

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
        Coin::all()->each(function (Coin $coin) {
            $paths = $coin->getPendingApprovalResourcePaths();

            foreach ($paths as $path) {
                $resource = $coin->getPendingApprovalResource($path);

                if ($resource instanceof PendingApproval) {
                    $lock = Cache::lock($resource->lockKey(), 120);

                    if ($lock->get()) {
                        $this->dispatch($resource, $coin, $lock->owner());
                    }
                }
            }
        });
        $this->info("Processing Complete.");
    }

    /**
     * @param $resource
     * @param $coin
     * @param $lockOwner
     * @return \Illuminate\Foundation\Bus\PendingDispatch
     */
    protected function dispatch($resource, $coin, $lockOwner)
    {
        return ProcessPendingApproval::dispatch($resource, $coin, $lockOwner);
    }
}
