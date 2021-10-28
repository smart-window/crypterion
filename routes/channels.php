<?php

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

use App\Http\Resources\User as UserResource;
use App\Models\Chat;
use App\Models\User;

Broadcast::channel('App.Chat.{chat}', function (User $user, Chat $chat) {
	if ($chat->shouldAllowUser($user)) {
		return new UserResource($user);
	}
});

Broadcast::channel('Auth.User.{id}', function (User $user, $id) {
	return $user->id == $id;
});

Broadcast::channel('Permission.ManageMarketplace', function (User $user) {
	return $user->can('manage_marketplace');
});
