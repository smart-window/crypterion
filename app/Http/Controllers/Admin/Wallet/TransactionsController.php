<?php

namespace App\Http\Controllers\Admin\Wallet;

use App\Models\TransferRecord;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TransactionsController extends Controller
{
    /**
     * @param Request $request
     */
    public function table(Request $request)
    {
        $filters = $request->get('filters', []);
        $records = TransferRecord::latest();

        if (array_has($filters, 'name') && $filters['name']) {
            $records->whereHas('walletAccount.user', function ($query) use ($filters) {
                $query->where('name', 'like', "%{$filters['name']}%");
            });
        }

        return paginateResult(
            $records,
            $request->get('itemPerPage', 10),
            $request->get('page')
        );
    }
}
