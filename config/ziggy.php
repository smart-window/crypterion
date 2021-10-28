<?php

return [
	'groups' => [
		'admin'  => [
			'admin.*',
			'user.auth*',
			'collections.*',
			'locale.*',
			'ip.*'
		],
		'index' => [
			'auth.*',
			'user.*',
			'marketplace.*',
			'wallet.*',
			'chats.*',
			'moderation.*',
			'collections.*',
			'locale.*',
			'storage.*',
			'home.*',
			'ip.*'
		],
		'installer' => [
			'installer.*'
		]
	],
];