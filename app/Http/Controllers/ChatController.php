<?php

namespace App\Http\Controllers;

use App\Http\Resources\Chat as ChatResource;
use App\Http\Resources\MarketplaceTrade as MarketplaceTradeResource;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class ChatController extends Controller
{
	/**
	 * Get chat resource
	 *
	 * @param Chat $chat
	 * @return ChatResource
	 */
	public function get(Chat $chat)
	{
		if (!$chat->shouldAllowUser(Auth::user())) {
			abort(403, trans('chat.access_forbidden'));
		}

		$chat->load([
			'participants' => function ($query) {
				$query->where('user_id', '!=', Auth::user()->id);
			},
			'participants.user'
		]);
		return new ChatResource($chat);
	}

	/**
	 * Update user's participation.
	 *
	 * @param Chat $chat
	 */
	public function updateParticipation(Chat $chat)
	{
		if (!$chat->shouldAllowUser(Auth::user())) {
			abort(403, trans('chat.access_forbidden'));
		} else {
			$chat->updateParticipation(Auth::user());
		}
	}

	/**
	 * @param Chat $chat
	 * @return MarketplaceTradeResource
	 */
	public function latestMarketplaceTrade(Chat $chat)
	{
		if (!$chat->shouldAllowUser(Auth::user())) {
			abort(403, trans('chat.access_forbidden'));
		}

		$trade = $chat->marketplaceTrades()
			->latest()->with('buyer', 'seller')
			->first();

		return new MarketplaceTradeResource($trade);
	}

	/**
	 * Get status of chat for authenticated user
	 *
	 * @param Chat $chat
	 * @return array
	 */
	public function participation(Chat $chat)
	{
		if (!$chat->shouldAllowUser(Auth::user())) {
			abort(403, trans('chat.access_forbidden'));
		}

		return $chat->getParticipation(Auth::user());
	}

	/**
	 * Return paginated result of authenticated chat
	 *
	 * @param Request $request
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function table(Request $request)
	{
		$chats = Auth::user()
			->participatingChats()->latest('updated_at')
			->with([
				'participants' => function ($query) {
					$query->where('user_id', '!=', Auth::user()->id);
				},
				'participants.user'
			]);

		$filters = $request->get('filters', []);

		if (array_has($filters, 'user') && $filters['user']) {
			$chats->whereHas('participants.user', function ($query) use ($filters) {
				$query->where('id', '!=', Auth::user()->id);
				$query->where('name', 'like', "%{$filters['user']}%");
			});
		}

		$results = paginateResult(
			$chats,
			$request->get('itemPerPage', 10),
			$request->get('page', 1)
		);

		return ChatResource::collection($results);
	}
}
