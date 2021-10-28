<?php

namespace App\Http\Controllers\Admin\Home\Widget;

use App\Http\Resources\MarketplaceTrade as MarketplaceTradeResource;
use App\Models\FailedJob;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FailedJobsController extends Controller
{
	/**
	 * Get paginated failed jobs
	 *
	 * @param Request $request
	 * @param $name
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function table(Request $request)
	{
		$failedJobs = FailedJob::latest('failed_at');

		return paginateResult(
			$failedJobs,
			$request->get('itemPerPage'),
			$request->get('page')
		);
	}

	/**
	 * Clear failed jobs
	 *
	 * @throws \Exception
	 */
	public function clear()
	{
		FailedJob::query()->delete();
	}
}
