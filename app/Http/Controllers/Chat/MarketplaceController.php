<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Http\Resources\MarketplaceTrade as MarketplaceTradeResource;
use App\Models\Exceptions\TransferException;
use App\Models\MarketplaceTrade;
use App\Notifications\Marketplace\TradeCancelled;
use App\Notifications\Marketplace\TradeDisputed;
use App\Notifications\Marketplace\TradeMarkedAsPaid;
use App\Notifications\Marketplace\TradeReceivedRating;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MarketplaceController extends Controller
{
    /**
     * Confirm trade aka Mark trade as paid..
     *
     * @param Request $request
     * @param MarketplaceTrade $trade
     * @return MarketplaceTradeResource
     * @throws Exception
     * @throws \Throwable
     */
    public function confirm(MarketplaceTrade $trade)
    {
        if (!$trade->canBeConfirmedBy(Auth::user())) {
            abort(403, trans('auth.access_forbidden'));
        }

        Cache::lock($trade->getLockKey())->get(function () use ($trade){
            $trade = $trade->fresh();
            $trade->update(['confirmed_at' => now()]);

            chatMessage('activity')->by(Auth::user())
                ->content([
                    'type'       => 'marketplace_trade_confirmed',
                    'parameters' => getTradeChatParameters($trade)
                ])
                ->save($trade->chat);

            $trade->seller->notify(new TradeMarkedAsPaid($trade));
            $trade->buyer->notify(new TradeMarkedAsPaid($trade));
        });

        return new MarketplaceTradeResource($trade);
    }

    /**
     * Submit a review for trade partner.
     *
     * @param MarketplaceTrade $trade
     * @param Request $request
     * @return \App\Models\Rating|void
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Throwable
     */
    public function submitReview(MarketplaceTrade $trade, Request $request)
    {
        $this->validate($request, [
            'comment' => 'required|string|min:3|max:200',
            'rating'  => 'required|integer|min:1|max:5'
        ]);

        $rating = $request->get('rating');
        $comment = $request->get('comment');

        if ($trade->sellerCanBeRatedBy(Auth::user())) {
            $model = rating()->by(Auth::user())->on($trade)
                ->rate($trade->seller, $rating, $comment);

            $trade->update(['seller_rateable' => false]);
            $trade->seller->notify(new TradeReceivedRating($trade, Auth::user()->name, $rating));

            return $model;
        }

        if ($trade->buyerCanBeRatedBy(Auth::user())) {
            $model = rating()->by(Auth::user())->on($trade)
                ->rate($trade->buyer, $rating, $comment);

            $trade->update(['buyer_rateable' => false]);
            $trade->buyer->notify(new TradeReceivedRating($trade, Auth::user()->name, $rating));

            return $model;
        }

        abort(403, trans('auth.action_forbidden'));
    }

    /**
     * Approve trade
     *
     * @param Request $request
     * @param MarketplaceTrade $trade
     * @return MarketplaceTradeResource
     * @throws \Throwable
     */
    public function approve(Request $request, MarketplaceTrade $trade)
    {
        if (!$trade->canBeApprovedBy(Auth::user())) {
            return abort(403, trans('auth.access_forbidden'));
        }

        $this->validate($request, [
            'code' => [
                'required', function ($attribute, $value, $fail) use ($trade) {
                    if (Auth::user()->shouldVerifyTwoFactorForMarketplace()) {
                        if (!Auth::user()->verifyTwoFactorKey($value)) {
                            $fail(trans('auth.invalid_token'));
                        }
                    } else {
                        if (!Hash::check($value, Auth::user()->password)) {
                            $fail(trans('auth.invalid_password'));
                        }
                    }
                }
            ]
        ]);

        try {
            $trade->process(Auth::user());
        } catch (TransferException $e) {
            $message = $e->getMessage();

            throw ValidationException::withMessages([
                'code' => [$message],
            ]);
        }

        return new MarketplaceTradeResource($trade);
    }

    /**
     * Cancel trade..
     *
     * @param Request $request
     * @param MarketplaceTrade $trade
     * @return MarketplaceTradeResource
     * @throws Exception
     * @throws \Throwable
     */
    public function cancel(MarketplaceTrade $trade)
    {
        if (!$trade->canBeCancelledBy(Auth::user())) {
            abort(403, trans('auth.access_forbidden'));
        }

        Cache::lock($trade->getLockKey())->get(function () use ($trade) {
            $trade = $trade->fresh();
            $trade->update(['status' => 'cancelled']);

            chatMessage('activity')->by(Auth::user())
                ->content([
                    'type'       => 'marketplace_trade_cancelled',
                    'parameters' => getTradeChatParameters($trade)
                ])
                ->save($trade->chat);

            $trade->buyer->notify(new TradeCancelled($trade));
            $trade->seller->notify(new TradeCancelled($trade));
        });

        return new MarketplaceTradeResource($trade);
    }

    /**
     * Dispute trade..
     *
     * @param Request $request
     * @param MarketplaceTrade $trade
     * @return MarketplaceTradeResource
     * @throws Exception
     * @throws \Throwable
     */
    public function dispute(MarketplaceTrade $trade)
    {
        if (!$trade->canBeDisputedBy(Auth::user())) {
            abort(403, trans('auth.access_forbidden'));
        }

        Cache::lock($trade->getLockKey())->get(function () use ($trade) {
            $trade = $trade->fresh();
            $trade->fill(['status' => 'dispute']);
            $trade->disputeBy()->associate(Auth::user());
            $trade->save();

            chatMessage('activity')->by(Auth::user())
                ->content([
                    'type'       => 'marketplace_trade_disputed',
                    'parameters' => getTradeChatParameters($trade)
                ])
                ->save($trade->chat);

            $trade->seller->notify(new TradeDisputed($trade));
            $trade->buyer->notify(new TradeDisputed($trade));
        });

        return new MarketplaceTradeResource($trade);
    }
}
