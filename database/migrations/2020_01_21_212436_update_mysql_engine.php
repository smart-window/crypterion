<?php

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatMessageActivity;
use App\Models\ChatMessageAttachment;
use App\Models\ChatMessageText;
use App\Models\ChatParticipant;
use App\Models\Fee;
use App\Models\MarketplaceCharge;
use App\Models\MarketplaceOffer;
use App\Models\MarketplaceTrade;
use App\Models\ModelHasPermission;
use App\Models\ModelHasRole;
use App\Models\NotificationDatabaseMessage;
use App\Models\NotificationEmailMessage;
use App\Models\NotificationSmsMessage;
use App\Models\PaymentMethod;
use App\Models\RoleHasPermission;
use App\Models\TransferRecord;
use App\Models\UserActivityLog;
use App\Models\UserNotificationSetting;
use App\Models\UserProfile;
use App\Models\UserTwoFactorSetting;
use App\Models\Wallet;
use App\Models\WalletAccount;
use App\Models\WalletAddress;
use App\Models\WalletTransaction;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateMysqlEngine extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		if (config('database.default') == "mysql") {
			$permissionTableNames = config('permission.table_names');

			$callbacks = [
				'payment_methods'                              => function (Blueprint $table) {
					PaymentMethod::whereDoesntHave('category')->delete();

					$table->foreign('category_id')->references('id')
						->on('payment_method_categories')->onDelete('cascade');
				},
				$permissionTableNames['model_has_permissions'] => function (Blueprint $table) use ($permissionTableNames) {
					ModelHasPermission::whereDoesntHave('permission')->delete();

					$table->foreign('permission_id')
						->references('id')
						->on($permissionTableNames['permissions'])
						->onDelete('cascade');
				},
				$permissionTableNames['model_has_roles']       => function (Blueprint $table) use ($permissionTableNames) {
					ModelHasRole::whereDoesntHave('role')->delete();

					$table->foreign('role_id')
						->references('id')->on($permissionTableNames['roles'])
						->onDelete('cascade');
				},
				$permissionTableNames['role_has_permissions']  => function (Blueprint $table) use ($permissionTableNames) {
					RoleHasPermission::whereDoesntHave('role')
						->orWhereDoesntHave('permission')->delete();

					$table->foreign('permission_id')
						->references('id')->on($permissionTableNames['permissions'])
						->onDelete('cascade');

					$table->foreign('role_id')
						->references('id')->on($permissionTableNames['roles'])
						->onDelete('cascade');
				},
				'wallets'                                      => function (Blueprint $table) {
					Wallet::whereDoesntHave('coin')->delete();

					$table->foreign('coin_id')->references('id')
						->on('coins')->onDelete('cascade');
				},
				'wallet_accounts'                              => function (Blueprint $table) {
					WalletAccount::whereDoesntHave('wallet')
						->orWhereDoesntHave('user')->delete();

					$table->foreign('wallet_id')->references('id')
						->on('wallets')->onDelete('cascade');

					$table->foreign('user_id')->references('id')
						->on('users')->onDelete('cascade');
				},
				'wallet_addresses'                             => function (Blueprint $table) {
					WalletAddress::whereDoesntHave('wallet')
						->orWhereDoesntHave('walletAccount')->delete();

					$table->foreign('wallet_id')->references('id')
						->on('wallets')->onDelete('cascade');

					$table->foreign('wallet_account_id')->references('id')
						->on('wallet_accounts')->onDelete('cascade');
				},
				'wallet_transactions'                          => function (Blueprint $table) {
					WalletTransaction::whereDoesntHave('wallet')->delete();

					$table->foreign('wallet_id')->references('id')
						->on('wallets')->onDelete('cascade');
				},
				'transfer_records'                             => function (Blueprint $table) {
					TransferRecord::whereDoesntHave('walletAccount')
						->orWhere(function ($query) {
							$query->whereNotNull('wallet_transaction_id')->whereDoesntHave('walletTransaction');
						})->delete();

					$table->foreign('wallet_account_id')->references('id')
						->on('wallet_accounts')->onDelete('cascade');

					$table->foreign('receiver_wallet_address_id')->references('id')
						->on('wallet_addresses')->onDelete('set null');

					$table->foreign('wallet_transaction_id')->references('id')
						->on('wallet_transactions')->onDelete('cascade');
				},
				'user_two_factor_settings'                     => function (Blueprint $table) {
					UserTwoFactorSetting::whereDoesntHave('user')->delete();

					$table->foreign('user_id')->references('id')
						->on('users')->onDelete('cascade');
				},
				'user_activity_logs'                           => function (Blueprint $table) {
					UserActivityLog::whereDoesntHave('user')->delete();

					$table->foreign('user_id')->references('id')
						->on('users')->onDelete('cascade');
				},
				'chats'                                        => function (Blueprint $table) {
					Chat::whereDoesntHave('creator')->update(['creator_id' => null]);

					$table->foreign('creator_id')->references('id')
						->on('users')->onDelete('set null');
				},
				'chat_participants'                            => function (Blueprint $table) {
					ChatParticipant::whereDoesntHave('chat')->delete();
					ChatParticipant::whereDoesntHave('user')->update(['user_id' => null]);

					$table->foreign('chat_id')->references('id')
						->on('chats')->onDelete('cascade');

					$table->foreign('user_id')->references('id')
						->on('users')->onDelete('set null');
				},
				'chat_messages'                                => function (Blueprint $table) {
					ChatMessage::whereDoesntHave('chat')->delete();
					ChatMessage::whereDoesntHave('user')->update(['user_id' => null]);

					$table->foreign('chat_id')->references('id')
						->on('chats')->onDelete('cascade');

					$table->foreign('user_id')->references('id')
						->on('users')->onDelete('set null');
				},
				'chat_message_attachments'                     => function (Blueprint $table) {
					ChatMessageAttachment::whereDoesntHave('message')->delete();

					$table->foreign('message_id')->references('id')
						->on('chat_messages')->onDelete('cascade');
				},
				'chat_message_texts'                           => function (Blueprint $table) {
					ChatMessageText::whereDoesntHave('message')->delete();

					$table->foreign('message_id')->references('id')
						->on('chat_messages')->onDelete('cascade');
				},
				'chat_message_activities'                      => function (Blueprint $table) {
					ChatMessageActivity::whereDoesntHave('message')->delete();

					$table->foreign('message_id')->references('id')
						->on('chat_messages')->onDelete('cascade');
				},
				'marketplace_offers'                           => function (Blueprint $table) {
					MarketplaceOffer::whereDoesntHave('walletAccount')
						->orWhereDoesntHave('user')
						->orWhere(function ($query) {
							$query->whereNotNull('payment_method_id')->whereDoesntHave('paymentMethod');
						})->delete();

					$table->foreign('wallet_account_id')->references('id')
						->on('wallet_accounts')->onDelete('cascade');

					$table->foreign('payment_method_id')->references('id')
						->on('payment_methods')->onDelete('cascade');

					$table->foreign('user_id')->references('id')
						->on('users')->onDelete('cascade');
				},
				'marketplace_trades'                           => function (Blueprint $table) {
					MarketplaceTrade::whereDoesntHave('buyer')
						->orWhereDoesntHave('seller')->orWhereDoesntHave('walletAccount')
						->delete();

					MarketplaceTrade::whereDoesntHave('chat')->update(['chat_id' => null]);
					MarketplaceTrade::whereDoesntHave('disputeBy')->update(['dispute_by' => null]);
					MarketplaceTrade::whereDoesntHave('offer')->update(['offer_id' => null]);

					$table->foreign('buyer_id')->references('id')
						->on('users')->onDelete('cascade');

					$table->foreign('seller_id')->references('id')
						->on('users')->onDelete('cascade');

					$table->foreign('chat_id')->references('id')
						->on('chats')->onDelete('set null');

					$table->foreign('wallet_account_id')->references('id')
						->on('wallet_accounts')->onDelete('cascade');

					$table->foreign('offer_id')->references('id')
						->on('marketplace_offers')->onDelete('set null');

					$table->foreign('dispute_by')->references('id')
						->on('users')->onDelete('set null');
				},
				'fees'                                         => function (Blueprint $table) {
					Fee::where(function ($query) {
						$query->whereNotNull('wallet_id')->whereDoesntHave('wallet');
					})->orWhere(function ($query) {
						$query->whereNotNull('payment_method_id')->whereDoesntHave('paymentMethod');
					})->delete();

					$table->foreign('wallet_id')->references('id')
						->on('wallets')->onDelete('cascade');

					$table->foreign('payment_method_id')->references('id')
						->on('payment_methods')->onDelete('cascade');
				},
				'user_profiles'                                => function (Blueprint $table) {
					UserProfile::whereDoesntHave('user')->delete();

					$table->foreign('user_id')->references('id')
						->on('users')->onDelete('cascade');
				},
				'user_notification_settings'                   => function (Blueprint $table) {
					UserNotificationSetting::whereDoesntHave('user')->delete();

					$table->foreign('user_id')->references('id')
						->on('users')->onDelete('cascade');
				},
				'notification_email_messages'                  => function (Blueprint $table) {
					NotificationEmailMessage::whereDoesntHave('template')->delete();

					$table->foreign('template_id')->references('id')
						->on('notification_templates')->onDelete('cascade');
				},
				'notification_sms_messages'                    => function (Blueprint $table) {
					NotificationSmsMessage::whereDoesntHave('template')->delete();

					$table->foreign('template_id')->references('id')
						->on('notification_templates')->onDelete('cascade');
				},
				'notification_database_messages'               => function (Blueprint $table) {
					NotificationDatabaseMessage::whereDoesntHave('template')->delete();

					$table->foreign('template_id')->references('id')
						->on('notification_templates')->onDelete('cascade');
				},
				'marketplace_charges'                          => function (Blueprint $table) {
					MarketplaceCharge::whereDoesntHave('walletAccount')->delete();

					$table->foreign('wallet_account_id')->references('id')
						->on('wallet_accounts')->onDelete('cascade');
				},
			];

			$manager = Schema::getConnection()->getDoctrineSchemaManager();

			foreach ($manager->listTableNames() as $table) {
				DB::statement(sprintf('ALTER TABLE %s ENGINE = InnoDB', $table));
			}

			foreach ($callbacks as $table => $callback) {
				if (empty($manager->listTableForeignKeys($table))) {
					Schema::table($table, $callback);
				}
			}
		}
	}
}
