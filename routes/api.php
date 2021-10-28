<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->group(function () {
	/**
	 * BEGIN: TWO FACTOR VERIFICATION
	 */
	Route::group([
		'prefix' => 'two-factor',
		'as'     => 'two-factor.',
	], function () {
		Route::post('verify', 'TwoFactorController@verify')->name('verify');
	});
	/**
	 * END: TWO FACTOR VERIFICATION
	 */

	// User Auth Routes
	Route::group([
		'prefix' => 'user',
		'as'     => 'user.',
	], function () {
		Route::post('auth', 'UserController@auth')->name('auth');

		Route::group([
			'prefix'    => 'wallet-account',
			'as'        => 'wallet-account.',
			'namespace' => 'User'
		], function () {
			Route::prefix('{walletAccount}')->group(function () {
				Route::post('calc-fee', 'WalletAccountController@calcFee')->name('calc-fee');
				Route::post('send', 'WalletAccountController@send')->name('send');
				Route::post('generate-address', 'WalletAccountController@generateAddress')->name('generate-address');
				Route::get('latest-address', 'WalletAccountController@latestAddress')->name('latest-address');

				Route::group([
					'prefix'    => 'wallet-address',
					'as'        => 'wallet-address.',
					'namespace' => 'WalletAccount'
				], function () {
					Route::post('table', 'WalletAddressController@table')->name('table');
				});
			});

			Route::post('list', 'WalletAccountController@list')->name('list');
			Route::post('total-available-price', 'WalletAccountController@totalAvailablePrice')->name('total-available-price');
		});


		Route::prefix('{name}')->group(function () {
			Route::group([
				'prefix'    => 'offers',
				'as'        => 'offers.',
				'namespace' => 'User'
			], function () {
				Route::post('hide', 'OffersController@hide')->name('hide');
				Route::post('show', 'OffersController@show')->name('show');
				Route::post('delete', 'OffersController@delete')->name('delete');
			});

			Route::group([
				'prefix'    => 'trades',
				'as'        => 'trades.',
				'namespace' => 'User'
			], function () {
				Route::post('table', 'TradesController@table')->name('table');
			});

			Route::group([
				'prefix'    => 'profile',
				'as'        => 'profile.',
				'namespace' => 'User'
			], function () {
				Route::post('upload-picture', 'ProfileController@uploadPicture')->name('upload-picture');
				Route::post('update-notification-settings', 'ProfileController@updateNotificationSettings')->name('update-notification-settings');
				Route::post('update-verification', 'ProfileController@updateVerification')->name('update-verification');
				Route::post('notification-settings', 'ProfileController@notificationSettings')->name('notification-settings');
				Route::post('update-details', 'ProfileController@updateDetails')->name('update-details');
				Route::post('update-preference', 'ProfileController@updatePreference')->name('update-preference');
				Route::post('resend-email-token', 'ProfileController@resendEmailToken')->name('resend-email-token');
				Route::post('resend-phone-token', 'ProfileController@resendPhoneToken')->name('resend-phone-token');
				Route::post('verify-email-token', 'ProfileController@verifyEmailToken')->name('verify-email-token');
				Route::post('verify-phone-token', 'ProfileController@verifyPhoneToken')->name('verify-phone-token');
				Route::post('two-factor-request', 'ProfileController@twoFactorRequest')->name('two-factor-request');
				Route::post('two-factor-enable', 'ProfileController@twoFactorEnable')->name('two-factor-enable');
				Route::post('two-factor-configure', 'ProfileController@twoFactorConfigure')->name('two-factor-configure');
				Route::post('change-password', 'ProfileController@changePassword')->name('change-password');
			});

			Route::group([
				'prefix'    => 'contacts',
				'as'        => 'contacts.',
				'namespace' => 'User'
			], function () {
				Route::post('add', 'ContactController@add')->name('add');
				Route::post('batch-remove', 'ContactController@batchRemove')->name('batch-remove');
				Route::post('remove', 'ContactController@remove')->name('remove');
				Route::post('trust', 'ContactController@trust')->name('trust');
				Route::post('block', 'ContactController@block')->name('block');
				Route::post('reset-status', 'ContactController@resetStatus')->name('reset-status');
				Route::post('table', 'ContactController@table')->name('table');
			});
		});

		Route::group([
			'prefix'    => 'notifications',
			'as'        => 'notifications.',
			'namespace' => 'User'
		], function () {
			Route::prefix('{notification}')->group(function () {
				Route::post('mark-as-read', 'NotificationController@markAsRead')->name('mark-as-read');
			});

			Route::post('status', 'NotificationController@status')->name('status');
			Route::post('update-status', 'NotificationController@updateStatus')->name('update-status');
			Route::post('mark-all-as-read', 'NotificationController@markAllAsRead')->name('mark-all-as-read');
			Route::post('table', 'NotificationController@table')->name('table');
		});

		Route::post('transfer-records-table', 'UserController@transferRecordsTable')->name('transfer-records-table');
		Route::post('set-online', 'UserController@setOnline')->name('set-online');
		Route::post('set-away', 'UserController@setAway')->name('set-away');
		Route::post('set-offline', 'UserController@setOffline')->name('set-offline');
	});

	// Marketplace Auth Routes
	Route::group([
		'prefix' => 'marketplace',
		'as'     => 'marketplace.',
	], function () {
		Route::group([
			'prefix'    => 'create-offer',
			'as'        => 'create-offer.',
			'namespace' => 'Marketplace'
		], function () {
			Route::post('sell', 'CreateOfferController@sell')->name('sell');
			Route::post('buy', 'CreateOfferController@buy')->name('buy');
		});

		Route::group([
			'prefix'    => 'offer',
			'as'        => 'offer.',
			'namespace' => 'Marketplace'
		], function () {
			Route::prefix("{offer}")->group(function () {
				Route::post('start-trade', 'OfferController@startTrade')->name('start-trade');
			});
		});

	});

	// Wallet Auth Routes
	Route::group([
		'prefix' => 'wallet',
		'as'     => 'wallet.',
	], function () {
		Route::post('add-account', 'WalletController@addAccount')->name('add-account');
		Route::get('list', 'WalletController@list')->name('list');
	});

	// Chats Auth Routes
	Route::group([
		'prefix' => 'chats',
		'as'     => 'chats.',
	], function () {
		Route::post('table', 'ChatController@table')->name('table');

		Route::prefix("{chat}")->group(function () {
			Route::group([
				'prefix'    => 'messages',
				'as'        => 'messages.',
				'namespace' => 'Chat'
			], function () {
				Route::post('save-text', 'MessageController@saveText')->name('save-text');
				Route::post('save-attachment', 'MessageController@saveAttachment')->name('save-attachment');
				Route::post('table', 'MessageController@table')->name('table');
			});

			Route::post('get', 'ChatController@get')->name('get');
			Route::post('latest-marketplace-trade', 'ChatController@latestMarketplaceTrade')->name('latest-marketplace-trade');
			Route::post('participation', 'ChatController@participation')->name('participation');
			Route::post('update-participation', 'ChatController@updateParticipation')->name('update-participation');
		});

		Route::group([
			'prefix'    => 'marketplace',
			'as'        => 'marketplace.',
			'namespace' => 'Chat'
		], function () {
			Route::prefix("{trade}")->group(function () {
				Route::post('approve', 'MarketplaceController@approve')->name('approve');
				Route::post('cancel', 'MarketplaceController@cancel')->name('cancel');
				Route::post('submit-review', 'MarketplaceController@submitReview')->name('submit-review');
				Route::post('confirm', 'MarketplaceController@confirm')->name('confirm');
				Route::post('dispute', 'MarketplaceController@dispute')->name('dispute');
			});
		});
	});

	// Moderation Auth Routes
	Route::group([
		'prefix' => 'moderation',
		'as'     => 'moderation.',
	], function () {
		Route::group([
			'prefix'    => 'disputed-trades',
			'as'        => 'disputed-trades.',
			'namespace' => 'Moderation'
		], function () {
			Route::post('table', 'DisputedTradeController@table')->name('table');
		});
	});

	// Storage Routes
	Route::group([
		'prefix' => 'storage',
		'as'     => 'storage.',
	], function () {
		Route::group([
			'prefix'    => 'chat-message',
			'as'        => 'chat-message.',
			'namespace' => 'Storage'
		], function () {
			Route::prefix('{message}')->group(function () {
				Route::get('download-attachment', 'ChatMessageController@downloadAttachment')->name('download-attachment');
			});
		});
	});


	/**
	 * BEGIN: Public Routes
	 */
	// User Routes
	Route::group([
		'prefix' => 'user',
		'as'     => 'user.',
	], function () {
		Route::prefix('{name}')->group(function () {
			Route::post('get', 'UserController@get')->name('get');
			Route::post('marketplace-ratings', 'UserController@marketplaceRatings')->name('marketplace-ratings');
			Route::post('data', 'UserController@data')->name('data');

			Route::group([
				'prefix'    => 'offers',
				'as'        => 'offers.',
				'namespace' => 'User'
			], function () {
				Route::post('table', 'OffersController@table')->name('table');
			});
		});
	});

	// Marketplace Routes
	Route::group([
		'prefix' => 'marketplace',
		'as'     => 'marketplace.',
	], function () {
		Route::group([
			'prefix'    => 'buy-coin',
			'as'        => 'buy-coin.',
			'namespace' => 'Marketplace'
		], function () {
			Route::post('table', 'BuyCoinController@table')->name('table');
		});

		Route::group([
			'prefix'    => 'sell-coin',
			'as'        => 'sell-coin.',
			'namespace' => 'Marketplace'
		], function () {
			Route::post('table', 'SellCoinController@table')->name('table');
		});

		Route::group([
			'prefix'    => 'offer',
			'as'        => 'offer.',
			'namespace' => 'Marketplace'
		], function () {
			Route::get('{offer}', 'OfferController@get')->name('get');
		});
	});

	Route::group([
		'prefix' => 'collections',
		'as'     => 'collections.',
	], function () {
		Route::get('currencies', 'CollectionsController@currencies')->name('currencies');
		Route::get('coins', 'CollectionsController@coins')->name('coins');
		Route::get('wallets', 'CollectionsController@wallets')->name('wallets');
		Route::get('marketplace-tags', 'CollectionsController@marketplaceTags')->name('marketplace-tags');
		Route::get('payment-methods', 'CollectionsController@paymentMethods')->name('payment-methods');
		Route::get('countries', 'CollectionsController@countries')->name('countries');
	});

	// IP Address Data
	Route::group([
		'prefix' => 'ip',
		'as'     => 'ip.',
	], function () {
		Route::post('info', 'IndexController@ipInfo')->name('info');
	});
	/**
	 * END: Public Routes
	 */

	Route::middleware(['installer:verify'])->group(base_path('routes/custom/api.php'));
});
