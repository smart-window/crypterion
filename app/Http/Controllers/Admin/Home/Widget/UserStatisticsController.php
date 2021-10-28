<?php

namespace App\Http\Controllers\Admin\Home\Widget;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserStatisticsController extends Controller
{
	/**
	 * Get registrations data
	 *
	 * @param Request $request
	 * @return \Illuminate\Support\Collection
	 */
	public function registrationsByDateData(Request $request)
	{
		$query = DB::table('users')
			->selectRaw('COUNT(*) as total');

		switch ($request->get('type', 'month')) {
			case 'year':
				$query->selectRaw('MONTHNAME(created_at) as date')
					->where('created_at', '>=', now()->subMonths(12))
					->groupBy('date');
				break;
			case 'month':
				$query->selectRaw('DAYOFMONTH(created_at) as date')
					->where('created_at', '>=', now()->subMonths(1))
					->groupBy('date');
		}

		return $query->get();
	}
}
