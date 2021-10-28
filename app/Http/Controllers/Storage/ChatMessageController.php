<?php

namespace App\Http\Controllers\Storage;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;

class ChatMessageController extends Controller
{
	/**
	 * Download attachment
	 *
	 * @param Request $request
	 * @param ChatMessage $message
	 * @param $hashName
	 * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
	 */
	public function downloadAttachment(Request $request, ChatMessage $message)
	{
		$user = $request->user();
		if (!$user || !$message->chat->shouldAllowUser($user)) {
			abort(403, trans('auth.access_forbidden'));
		}

		$attachment = $message->attachment;
		if ($message->type !== 'attachment' || !$attachment) {
			abort(404, trans('chat.attachment_not_found'));
		}

		$path = $message->chat->attachmentsDir() . '/' . $attachment->hash_name;

		if (!Storage::exists($path)) {
			abort(404, trans('storage.file_not_found'));
		}

		return Response::download(Storage::path($path), $attachment->name);
	}
}
