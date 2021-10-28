<?php

namespace App\Http\Controllers\Admin\Wallet;

use App\Models\MarketplaceCharge;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class EarningsController extends Controller
{
	/**
	 * Paginate Marketplace charges result
	 *
	 * @param Request $request
	 * @return mixed
	 */
    public function marketplaceTable(Request $request)
    {
    	$marketplaceCharges = MarketplaceCharge::latest();

	    return paginateResult(
		    $marketplaceCharges,
		    $request->get('itemPerPage', 10),
		    $request->get('page')
	    );
    }
}
