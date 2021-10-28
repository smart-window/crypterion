<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatMessage as ChatMessageResource;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
	/**
	 * @param Request $request
	 * @param Chat $chat
	 * @return ChatMessageResource
	 * @throws \Illuminate\Validation\ValidationException
	 * @throws \Throwable
	 */
	public function saveText(Request $request, Chat $chat)
	{
		$this->validate($request, [
			'body' => 'required|string|min:1|max:5000'
		]);

		if (!$chat->shouldAllowUser(Auth::user())) {
			abort(403, trans('chat.access_forbidden'));
		}

		$body = $request->get('body');

		$message = DB::transaction(function () use ($chat, $body) {
			return chatMessage('text')
				->content(['body' => $body])
				->by(Auth::user())
				->save($chat);
		});

		return new ChatMessageResource($message);
	}


	/**
	 * @param Request $request
	 * @param Chat $chat
	 * @return ChatMessageResource
	 * @throws \Illuminate\Validation\ValidationException
	 * @throws \Throwable
	 */
	public function saveAttachment(Request $request, Chat $chat)
	{
		if (!$chat->shouldAllowUser(Auth::user())) {
			abort(403, trans('chat.access_forbidden'));
		}

		$this->validate($request, [
			'file' => ['required', 'file', 'max:10000']
		]);

		$file = $request->file('file');

		$message = DB::transaction(function () use ($chat, $file) {
			$file->storeAs($chat->attachmentsDir(), $file->hashName());

			return chatMessage('attachment')
				->content([
					'hash_name' => $file->hashName(),
					'name'      => $file->getClientOriginalName(),
					'size'      => $file->getSize(),
					'mime_type' => $file->getMimeType(),
				])
				->by(Auth::user())
				->save($chat);
		});

		return new ChatMessageResource($message);
	}

	/**
	 * @param Request $request
	 * @param Chat $chat
	 * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
	 */
	public function table(Request $request, Chat $chat)
	{
		if (!$chat->shouldAllowUser(Auth::user())) {
			abort(403, trans('chat.access_forbidden'));
		}

		$messages = $chat->messages()
			->with('user')->latest();

		$filters = $request->get('filters', []);

		$results = paginateResult(
			$messages,
			$request->get('itemPerPage', 10),
			$request->get('page'),
			array_only($filters, ['message'])
		);

		return ChatMessageResource::collection($results);
	}
}
