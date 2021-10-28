<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::prefix('web')->group(function () {
	Route::group([
		'prefix' => 'installer',
		'as'     => 'installer.',
	], function () {
		Route::group([
			'prefix'    => 'license',
			'namespace' => 'Installer',
			'as'        => 'license.',
		], function () {
			Route::post('verify', 'LicenseController@verify')->name('verify');
		});

		Route::group([
			'prefix'    => 'requirement',
			'namespace' => 'Installer',
			'as'        => 'requirement.',
		], function () {
			Route::post('data', 'RequirementController@data')->name('data');
		});

		Route::group([
			'prefix'    => 'environment',
			'namespace' => 'Installer',
			'as'        => 'environment.',
		], function () {
			Route::post('data', 'EnvironmentController@data')->name('data');
			Route::post('update', 'EnvironmentController@update')->name('update');
		});

		Route::group([
			'prefix'    => 'administrator',
			'namespace' => 'Installer',
			'as'        => 'administrator.',
		], function () {
			Route::post('register', 'AdministratorController@register')->name('register');
		});
	});

	/**
	 * BEGIN: AUTHENTICATION ROUTES
	 */
	// Admin Authentication Routes
	Route::group([
		'prefix'    => 'admin',
		'namespace' => 'Admin',
		'as'        => 'admin.',
	], function () {
		Route::group([
			'prefix'    => 'auth',
			'namespace' => 'Auth',
			'as'        => 'auth.',
		], function () {
			Route::post('login', 'LoginController@login')->name('login');
			Route::post('logout', 'LoginController@logout')->name('logout');
		});
	});

	// User Authentication Routes
	Route::group([
		'prefix'     => 'auth',
		'namespace'  => 'Auth',
		'middleware' => 'installer:verify',
		'as'         => 'auth.',
	], function () {
		Route::post('login', 'LoginController@login')->name('login');
		Route::post('register', 'RegisterController@register')->name('register');
		Route::post('logout', 'LoginController@logout')->name('logout');

		Route::group([
			'prefix' => 'reset-password',
			'as'     => 'reset-password.'
		], function () {
			Route::post('reset', 'ResetPasswordController@reset')->name('reset');
			Route::post('verify-phone-token', 'ResetPasswordController@verifyPhoneToken')->name('verify-phone-token');
			Route::post('send-phone-token', 'ResetPasswordController@sendPhoneToken')->name('send-phone-token');
			Route::post('verify-email-token', 'ResetPasswordController@verifyEmailToken')->name('verify-email-token');
			Route::post('send-email-token', 'ResetPasswordController@sendEmailToken')->name('send-email-token');
		});
	});
	/**
	 * END AUTHENTICATION ROUTES
	 */

	Route::middleware('auth')->group(function () {
		// Admin Auth Web Routes
		Route::group([
			'prefix'     => 'admin',
			'middleware' => 'permission:access_control_panel',
			'as'         => 'admin.',
		], function () {
			Route::group([
				'prefix'    => 'home',
				'as'        => 'home.',
				'namespace' => 'Admin'
			], function () {
				// Widget Routes
				Route::group([
					'prefix'    => 'widget',
					'as'        => 'widget.',
					'namespace' => 'Home'
				], function () {
					Route::get('', 'WidgetController@list')->name('list');

					Route::middleware('permission:manage_customization')->group(function () {
						Route::post('set-dimensions', 'WidgetController@setDimensions')->name('set-dimensions');
					});

					Route::group([
						'prefix'    => 'user-statistics',
						'as'        => 'user-statistics.',
						'namespace' => 'Widget'
					], function () {
						Route::post('registrations-by-date-data', 'UserStatisticsController@registrationsByDateData')->name('registrations-by-date-data');
					});

					Route::group([
						'prefix'    => 'marketplace-statistics',
						'as'        => 'marketplace-statistics.',
						'namespace' => 'Widget'
					], function () {
						Route::get('data', 'MarketplaceStatisticsController@data')->name('data');
						Route::post('earnings-by-date-data', 'MarketplaceStatisticsController@earningsByDateData')->name('earnings-by-date-data');
					});

					Route::group([
						'prefix'    => 'statistics',
						'as'        => 'statistics.',
						'namespace' => 'Widget'
					], function () {
						Route::get('total-earnings', 'StatisticsController@totalEarnings')->name('total-earnings');
						Route::get('total-users', 'StatisticsController@totalUsers')->name('total-users');
					});

					Route::group([
						'prefix'    => 'failed-jobs',
						'as'        => 'failed-jobs.',
						'namespace' => 'Widget'
					], function () {
						Route::post('table', 'FailedJobsController@table')->name('table');
						Route::post('clear', 'FailedJobsController@clear')->name('clear');
					});
				});
			});

			Route::group([
				'prefix'     => 'wallets',
				'as'         => 'wallets.',
				'middleware' => 'permission:manage_wallets',
				'namespace'  => 'Admin'
			], function () {
				Route::get('data', 'WalletController@data')->name('data');
				Route::post('add', 'WalletController@add')->name('add');

				Route::prefix('{identifier}')->group(function () {
					Route::delete('remove', 'WalletController@remove')->name('remove');
					Route::post('relay-transaction', 'WalletController@relayTransaction')->name('relay-transaction');
					Route::post('reset-webhook', 'WalletController@resetWebhook')->name('reset-webhook');
				});

				Route::group([
					'prefix'    => 'earnings',
					'as'        => 'earnings.',
					'namespace' => 'Wallet'
				], function () {
					Route::post('marketplace-table', 'EarningsController@marketplaceTable')->name('marketplace-table');
				});

				Route::group([
					'prefix'    => 'pending-approval',
					'as'        => 'pending-approval.',
					'namespace' => 'Wallet'
				], function () {
					Route::post('table', 'PendingApprovalController@table')->name('table');
				});

				Route::group([
					'prefix'    => 'transactions',
					'as'        => 'transactions.',
					'namespace' => 'Wallet'
				], function () {
					Route::post('table', 'TransactionsController@table')->name('table');
				});
			});

			Route::group([
				'prefix'     => 'settings',
				'as'         => 'settings.',
				'middleware' => 'permission:manage_settings',
				'namespace'  => 'Admin'
			], function () {
				Route::group([
					'prefix'    => 'configuration',
					'as'        => 'configuration.',
					'namespace' => 'Settings'
				], function () {
					Route::group([
						'prefix'    => 'notification',
						'as'        => 'notification.',
						'namespace' => 'Configuration'
					], function () {
						Route::get('data', 'NotificationController@data')->name('data');
						Route::post('update', 'NotificationController@update')->name('update');
					});

					Route::group([
						'prefix'    => 'environment',
						'as'        => 'environment.',
						'namespace' => 'Configuration'
					], function () {
						Route::get('data', 'EnvironmentController@data')->name('data');
						Route::post('update', 'EnvironmentController@update')->name('update');
					});

					Route::group([
						'prefix'    => 'marketplace',
						'as'        => 'marketplace.',
						'namespace' => 'Configuration'
					], function () {
						Route::get('data', 'MarketplaceController@data')->name('data');
						Route::post('update', 'MarketplaceController@update')->name('update');
					});

					Route::group([
						'prefix'    => 'wallet',
						'as'        => 'wallet.',
						'namespace' => 'Configuration'
					], function () {
						Route::get('data', 'WalletController@data')->name('data');
						Route::post('update', 'WalletController@update')->name('update');
					});
				});

				Route::group([
					'prefix'     => 'notification',
					'as'         => 'notification.',
					'middleware' => 'permission:manage_notification',
					'namespace'  => 'Settings'
				], function () {
					Route::group([
						'prefix'     => 'templates',
						'as'         => 'templates.',
						'middleware' => 'permission:manage_notification',
						'namespace'  => 'Notification'
					], function () {
						Route::get('', 'TemplateController@list')->name('list');

						Route::prefix('{template}')->group(function () {
							Route::post('update-sms-message', 'TemplateController@updateSmsMessage')->name('update-sms-message');
							Route::post('update-database-message', 'TemplateController@updateDatabaseMessage')->name('update-database-message');
							Route::post('update-email-message', 'TemplateController@updateEmailMessage')->name('update-email-message');
						});
					});
				});

				Route::group([
					'prefix'     => 'marketplace',
					'as'         => 'marketplace.',
					'middleware' => 'permission:manage_marketplace',
					'namespace'  => 'Settings'
				], function () {
					Route::group([
						'prefix'    => 'payment',
						'as'        => 'payment.',
						'namespace' => 'Marketplace'
					], function () {
						Route::get('data', 'PaymentController@data')->name('data');

						Route::group([
							'prefix' => 'method-categories',
							'as'     => 'method-categories.',
						], function () {
							Route::post('', 'PaymentController@createMethodCategory')->name('create');

							Route::prefix("{category}")->group(function () {
								Route::delete('', 'PaymentController@deleteMethodCategory')->name('delete');
								Route::post('', 'PaymentController@updateMethodCategory')->name('update');
							});
						});

						Route::group([
							'prefix' => 'methods',
							'as'     => 'methods.',
						], function () {
							Route::post('', 'PaymentController@createMethod')->name('create');

							Route::prefix("{method}")->group(function () {
								Route::delete('', 'PaymentController@deleteMethod')->name('delete');
								Route::post('', 'PaymentController@updateMethod')->name('update');
							});
						});
					});

					Route::group([
						'prefix'    => 'tags',
						'as'        => 'tags.',
						'namespace' => 'Marketplace'
					], function () {
						Route::get('', 'TagController@list')->name('list');
						Route::post('', 'TagController@create')->name('create');

						Route::prefix("{tag}")->group(function () {
							Route::delete('', 'TagController@delete')->name('delete');
							Route::post('', 'TagController@update')->name('update');
						});
					});
				});
			});

			Route::group([
				'prefix'    => 'platform',
				'as'        => 'platform.',
				'namespace' => 'Admin'
			], function () {
				Route::group([
					'prefix'     => 'translation',
					'as'         => 'translation.',
					'middleware' => 'permission:manage_translation',
					'namespace'  => 'Platform'
				], function () {
					Route::prefix('{group}')->group(function () {
						Route::get('data', 'TranslationController@groupData')->name('group-data');
						Route::post('export', 'TranslationController@groupExport')->name('group-export');
						Route::post('update', 'TranslationController@groupUpdate')->name('group-update');
						Route::post('table', 'TranslationController@groupTable')->name('group-table');
					});

					Route::get('data', 'TranslationController@data')->name('data');
					Route::post('add-locale', 'TranslationController@addLocale')->name('add-locale');
					Route::post('remove-locale', 'TranslationController@removeLocale')->name('remove-locale');
					Route::post('import', 'TranslationController@import')->name('import');
				});

				Route::group([
					'prefix'     => 'customize',
					'as'         => 'customize.',
					'middleware' => 'permission:manage_customization',
					'namespace'  => 'Platform'
				], function () {
					Route::group([
						'prefix'    => 'template',
						'as'        => 'template.',
						'namespace' => 'Customize'
					], function () {
						Route::post('set-layout-type', 'TemplateController@setLayoutType')->name('set-layout-type');
						Route::post('set-nav-style', 'TemplateController@setNavStyle')->name('set-nav-style');
						Route::post('set-color-palettes', 'TemplateController@setColorPalettes')->name('set-color-palettes');
						Route::post('set-theme-type', 'TemplateController@setThemeType')->name('set-theme-type');
					});

					Route::group([
						'prefix'    => 'brand',
						'as'        => 'brand.',
						'namespace' => 'Customize'
					], function () {
						Route::post('upload-logo-icon', 'BrandController@uploadLogoIcon')->name('upload-logo-icon');
						Route::post('upload-logo', 'BrandController@uploadLogo')->name('upload-logo');
						Route::post('upload-logo-dark', 'BrandController@uploadLogoDark')->name('upload-logo-dark');
						Route::post('upload-favicon', 'BrandController@uploadFavicon')->name('upload-favicon');
					});

					Route::group([
						'prefix'    => 'page',
						'as'        => 'page.',
						'namespace' => 'Customize'
					], function () {
						Route::group([
							'prefix'    => 'footer',
							'as'        => 'footer.',
							'namespace' => 'Page'
						], function () {
							Route::get('data', 'FooterController@data')->name('data');
							Route::post('update', 'FooterController@update')->name('update');
						});
					});

					Route::group([
						'prefix'    => 'widgets',
						'as'        => 'widgets.',
						'namespace' => 'Customize'
					], function () {
						Route::group([
							'prefix' => '{category}',
						], function () {
							Route::get('data', 'WidgetController@data')->name('data');
							Route::post('toggle-enabled', 'WidgetController@toggleEnabled')->name('toggle-enabled');
						});
					});
				});

				Route::group([
					'prefix'     => 'integration',
					'as'         => 'integration.',
					'middleware' => 'permission:manage_integration',
					'namespace'  => 'Platform'
				], function () {
					Route::group([
						'prefix'    => 'oauth',
						'as'        => 'oauth.',
						'namespace' => 'Integration'
					], function () {
						Route::get('clients', 'OAuthController@clientList')->name('client-list');
						Route::delete('clients/{client}', 'OAuthController@clientDelete')->name('client-delete');
						Route::post('clients', 'OAuthController@clientCreate')->name('client-create');
					});
				});
			});

			Route::group([
				'prefix'     => 'users',
				'as'         => 'users.',
				'middleware' => 'permission:manage_users',
				'namespace'  => 'Admin'
			], function () {
				Route::prefix('{user}')->group(function () {
					Route::post('change-role', 'UserController@changeRole')->name('change-role');
					Route::post('activate', 'UserController@activate')->name('activate');
					Route::post('deactivate', 'UserController@deactivate')->name('deactivate');
					Route::delete('', 'UserController@delete')->name('delete');
				});

				Route::get('roles', 'UserController@roles')->name('roles');
				Route::post('batch-activate', 'UserController@batchActivate')->name('batch-activate');
				Route::post('batch-deactivate', 'UserController@batchDeactivate')->name('batch-deactivate');
				Route::post('batch-delete', 'UserController@batchDelete')->name('batch-delete');
				Route::post('table', 'UserController@table')->name('table');
			});

			Route::group([
				'prefix'     => 'roles',
				'as'         => 'roles.',
				'middleware' => 'permission:manage_user_roles',
				'namespace'  => 'Admin'
			], function () {
				Route::post('', "RoleController@create")->name('create');
				Route::get('data', "RoleController@data")->name('data');

				Route::prefix('{role}')->group(function () {
					Route::delete('', "RoleController@delete")->name('delete');
					Route::post('', "RoleController@update")->name('update');
				});
			});
		});


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

						Route::prefix('{walletAddress}')->group(function () {
							Route::post('reset-webhook', 'WalletAddressController@resetWebhook')->name('reset-webhook');
						});
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
				Route::post('price', 'CreateOfferController@price')->name('price');
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
	});

	/**
	 * BEGIN PUBLIC ROUTES
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

	// Locale Routes
	Route::group([
		'prefix' => 'locale',
		'as'     => 'locale.',
	], function () {
		Route::post('set', 'LocaleController@set')->name('set');
		Route::post('get', 'LocaleController@get')->name('get');
	});

	Route::group([
		'prefix' => 'home',
		'as'     => 'home.',
	], function () {
		// Widget Routes
		Route::group([
			'prefix'    => 'widget',
			'as'        => 'widget.',
			'namespace' => 'Home'
		], function () {
			Route::get('', 'WidgetController@list')->name('list');

			Route::middleware('permission:manage_customization')->group(function () {
				Route::post('set-dimensions', 'WidgetController@setDimensions')->name('set-dimensions');
			});

			Route::group([
				'prefix'    => 'price',
				'as'        => 'price.',
				'namespace' => 'Widget'
			], function () {
				Route::prefix('{identifier}')->group(function () {
					Route::post('data', 'PriceController@data')->name('data');
				});
			});

			// Authenticated
			Route::middleware('auth')->group(function () {
				Route::group([
					'prefix'    => 'marketplace-statistics',
					'as'        => 'marketplace-statistics.',
					'namespace' => 'Widget'
				], function () {
					Route::post('trade-status-data', 'MarketplaceStatisticsController@tradeStatusData')->name('trade-status-data');
				});
			});
		});
	});
	/**
	 * END PUBLIC ROUTES
	 */
});

/**
 * BEGIN: WEBHOOK Routes
 */
Route::group([
	'prefix' => 'coin',
	'as'     => 'coin.',
], function () {
	Route::prefix('{identifier}')->group(function () {
		Route::group([
			'prefix' => 'webhook',
			'as'     => 'webhook.'
		], function () {
			Route::post('transaction', 'CoinController@handleTransactionWebhook')->name('transaction');
			Route::post('pending-approval', 'CoinController@handlePendingApprovalWebhook')->name('pending-approval');
		});
	});
});
/**
 * END: WEBHOOK Routes
 */

Route::get('installer', 'InstallerController@view')->name('installer');

Route::middleware(['installer'])
	->group(function () {
		Route::get('admin{any?}', 'AdminController@view')
			->where('any', '.*')->name('admin');
	});

Route::middleware(['installer:verify'])->group(base_path('routes/custom/web.php'));

Route::middleware(['installer:verify'])
	->group(function () {
		Route::get('{any?}', 'IndexController@view')
			->where('any', '.*')->name('index');
	});

