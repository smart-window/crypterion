<?php

namespace App\Http\Controllers\Admin\Wallet;

use App\Models\PendingApproval;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PendingApprovalController extends Controller
{
    /**
     * @param Request $request
     */
    public function table(Request $request)
    {
        $pendingApprovals = PendingApproval::has('transferRecord');

        return paginateResult(
            $pendingApprovals,
            $request->get('itemPerPage', 10),
            $request->get('page')
        );
    }
}
