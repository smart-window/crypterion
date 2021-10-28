<?php
/**
 * ======================================================================================================
 * File Name: installer.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 11/17/2019 (11:16 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */


return [
	/*
	|--------------------------------------------------------------------------
	| Server Requirements
	|--------------------------------------------------------------------------
	*/

	'core' => [
		'minPhpVersion' => '7.1.3'
	],

	'requirements' => [
		'php' => [
			'intl',
			'bcmath',
			'openssl',
			'pdo',
			'mbstring',
			'tokenizer',
			'xml',
			'ctype',
			'dom',
			'JSON',
			'cURL',
			'gd',
			'fileinfo',
		]
	],

	/*
	|--------------------------------------------------------------------------
	| Files & Folders Permissions
	|--------------------------------------------------------------------------
	*/
	'permissions'  => [
		'storage' => [
			'recursive' => true
		],
		'bootstrap/cache' => [
			'recursive' => true
		],
		'.env' => [
			'recursive' => false
		],
		'public' => [
			'recursive' => false
		],
	],


	/*
	|--------------------------------------------------------------------------
	| Artisan Commands
	|--------------------------------------------------------------------------
	*/
	'post_install' => [
		'commands' => [
			'queue:restart',
			'currency:manage add all',
			'passport:keys --force',
			'storage:link'
		]
	]
];