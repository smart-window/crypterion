<?php

namespace App\Models;

use App\Events\UserPresenceChanged;
use App\Events\UserUpdated;
use App\Models\Traits\Rateable;
use ArrayObject;
use Cache;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use JSsVPSDioNXpfRC;
use Laravel\Passport\HasApiTokens;
use PragmaRX\Google2FA\Google2FA;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles, HasApiTokens, Notifiable, SoftDeletes, Rateable;

    protected $allRolesAttribute;
    protected $allPermissionsAttribute;

    protected $trustedByCountAttribute;
    protected $blockedByCountAttribute;
    protected $authenticatedContactPivotAttribute;

    protected $marketplaceStatsAttribute;

    protected $averageMarketplaceRatingAttribute;
    protected $totalMarketplaceRatingAttribute;

    protected $allContactsAttribute;
    protected $trustedContactsAttribute;
    protected $levelAttribute;
    protected $userLocationAttribute;

    protected $notificationSettingsAttribute;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'phone', 'presence',
        'phone_verified_at', 'email_verified_at',
        'two_factor_secret', 'inactive_until',
        'notifications_read_at', 'last_login_at',
        'last_seen_at', 'password', 'currency',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token', 'roles', 'permissions',
        'two_factor_secret', 'activity_logs',
        'scheduled_deactivate', 'scheduled_delete'
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'inactive_until',
        'scheduled_deactivate',
        'last_seen_at',
        'notifications_read_at',
        'last_login_at',
        'email_verified_at',
        'phone_verified_at',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'level'            => "integer",
        'scheduled_delete' => "boolean",
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'location',
        'total_marketplace_rating',
        'average_marketplace_rating',
        'marketplace_stats',
        'level',
        'all_permissions',
        'all_roles',
    ];

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'updated' => UserUpdated::class,
    ];

    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = [
        'profile', 'twoFactorSetting'
    ];

    /**
     * Boot the Model.
     */
    public static function boot()
    {
        parent::boot();

        $crypterion = static::resolveCrypterion();

        $google2FA = resolve(Google2FA::class);

        static::creating(function ($user) use ($google2FA, $crypterion) {
            if (!$crypterion->license()->isExtended() && static::count() >= 100) {
                return app()->abort(402, 'Your license has reached its usage limit');
            }
            $user->two_factor_secret = $google2FA->generateSecretKey();
        });

        static::created(function (User $user) {
            $user->updateNotificationSettings();
            $user->twoFactorSetting()->save(new UserTwoFactorSetting());
            $user->profile()->save(new UserProfile());
        });
    }

    /**
     * Resolve crypterion
     *
     * @return mixed|JSsVPSDioNXpfRC
     */
    protected static function resolveCrypterion()
    {
        $crypterion = resolve('crypterion');

        if (!is_subclass_of($crypterion, 'JSsVPSDioNXpfRC')) {
            return app()->abort(500, 'Corrupted filesystem.');
        } else {
            return $crypterion;
        }
    }

    /**
     * Get wallet address label
     *
     * @return mixed|string
     */
    public function walletAddressLabel()
    {
        return $this->email;
    }

    /**
     * Get user roles
     *
     * @return array
     */
    public function getAllRolesAttribute()
    {
        if (!isset($this->allRolesAttribute)) {
            $this->allRolesAttribute = $this->getRoleNames()->toArray();
        }
        return $this->allRolesAttribute;
    }

    /**
     * Get user permissions
     *
     * @return array
     * @throws \Exception
     */
    public function getAllPermissionsAttribute()
    {
        if (!isset($this->allPermissionsAttribute)) {
            $this->allPermissionsAttribute = $this->getAllPermissions()->pluck('name')->toArray();
        }
        return $this->allPermissionsAttribute;
    }

    /**
     * Get location activity
     *
     * @return mixed|null
     */
    public function getLocationAttribute()
    {
        if (!isset($this->userLocationAttribute)) {
            $lastActivity = $this->activityLogs()->latest()->first();
            $location = $lastActivity ? $lastActivity->location : [];
            $this->userLocationAttribute = new ArrayObject($location);
        }

        return is_countable($this->userLocationAttribute) &&
        count($this->userLocationAttribute) ?
            $this->userLocationAttribute : null;
    }

    /**
     * Route notifications for the Nexmo channel.
     *
     * @param \Illuminate\Notifications\Notification $notification
     * @return string
     */
    public function routeNotificationForNexmo($notification)
    {
        return preg_replace('/\D+/', '', $this->phone);
    }

    /**
     * The channels the user receives notification broadcasts on.
     *
     * @return string
     */
    public function receivesBroadcastNotificationsOn()
    {
        return 'Auth.User.' . $this->id;
    }

    /**
     * @param $value
     * @return string
     */
    public function getCurrencyAttribute($value)
    {
        return $value ?: currency()->getUserCurrency();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany|WalletAccount
     */
    public function walletAccounts()
    {
        return $this->hasMany('App\Models\WalletAccount', 'user_id', 'id');
    }

    /**
     * Encrypt Two Factor Secret.
     *
     * @param string $value
     * @return void
     */
    public function setTwoFactorSecretAttribute($value)
    {
        $this->attributes['two_factor_secret'] = encrypt($value);
    }

    /**
     * Decrypt Two Factor Secret.
     *
     * @param string $value
     * @return void
     */
    public function getTwoFactorSecretAttribute($value)
    {
        return decrypt($value);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function twoFactorSetting()
    {
        return $this->hasOne(UserTwoFactorSetting::class, 'user_id', 'id');
    }

    /**
     * User activity logs
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function activityLogs()
    {
        return $this->hasMany(UserActivityLog::class, 'user_id', 'id');
    }

    /**
     * Log user activity
     *
     * @param $subject
     * @param null $ip
     * @param string $agent
     */
    public function logActivity($subject, $agent = null, $ip = null)
    {
        $location = array_except(geoip($ip)->toArray(), ['ip']);

        $this->activityLogs()->create([
            'agent'    => $agent,
            'ip'       => $ip ?: "",
            'location' => $location['default'] ? [] : $location,
            'subject'  => $subject,
        ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough|TransferRecord
     */
    public function transferRecords()
    {
        return $this->hasManyThrough(
            TransferRecord::class,
            WalletAccount::class,
            'user_id',
            'wallet_account_id',
            'id',
            'id'
        );
    }

    /**
     * Verify Two Factor key.
     *
     * @param $key
     * @return bool|int
     * @throws \PragmaRX\Google2FA\Exceptions\IncompatibleWithGoogleAuthenticatorException
     * @throws \PragmaRX\Google2FA\Exceptions\InvalidCharactersException
     * @throws \PragmaRX\Google2FA\Exceptions\SecretKeyTooShortException
     */
    public function verifyTwoFactorKey($key)
    {
        $google2FA = resolve(Google2FA::class);
        return $google2FA->verifyKey($this->two_factor_secret, $key);
    }

    /**
     * Get Two Factor QR code url
     *
     * @return string
     */
    public function getTwoFactorQRCodeUrl()
    {
        $google2FA = resolve(Google2FA::class);

        return $google2FA->getQRCodeUrl(config('app.name'), $this->email, $this->two_factor_secret);
    }

    /**
     * Should verify token for authentication
     *
     * @return bool
     */
    public function shouldVerifyTwoFactorForAuthentication()
    {
        $setting = $this->twoFactorSetting;
        return $setting->enabled && $setting->authentication;
    }

    /**
     * Should verify token for marketplace
     *
     * @return bool
     */
    public function shouldVerifyTwoFactorForMarketplace()
    {
        $setting = $this->twoFactorSetting;
        return $setting->enabled && $setting->marketplace;
    }

    /**
     * Should verify token for outgoing transfer
     *
     * @return bool
     */
    public function shouldVerifyTwoFactorForOutgoingTransfer()
    {
        $setting = $this->twoFactorSetting;
        return $setting->enabled && $setting->outgoing_transfer;
    }

    /**
     * Get two factor api verification key
     *
     * @return string
     */
    protected function twoFactorApiVerificationKey()
    {
        return 'two_factor.' . $this->token() . '.verification';
    }

    /**
     * Check if twoFactor has been verified via api.
     *
     * @return bool
     */
    public function twoFactorVerifiedViaApi()
    {
        $key = $this->twoFactorApiVerificationKey();
        return Cache::has($key) && Cache::get($key);
    }

    /**
     * Set two factor api verification status
     *
     * @param null $expires
     * @return bool
     */
    public function setTwoFactorApiVerification($expires = null)
    {
        $key = $this->twoFactorApiVerificationKey();
        if (is_null($expires)) {
            $lifetime = now()->addMinutes(config()->get('session.lifetime'));
        } else {
            $lifetime = Carbon::parse($expires);
        }
        return Cache::put($key, true, $lifetime);
    }

    /**
     * @return int|null
     */
    public function level()
    {
        if (!isset($this->levelAttribute)) {
            $roles = $this->roles()->orderBy('level');

            if ($role = $roles->first()) {
                $level = $role->level;
            } else {
                $level = 0;
            }

            $this->levelAttribute = $level;
        }
        return $this->levelAttribute;

    }

    public function getLevelAttribute()
    {
        return $this->level();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id', 'id');
    }

    /**
     * Query Marketplace offers created by this user
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function availableMarketplaceOffers()
    {
        return $this->marketplaceOffers()->latest();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function marketplaceOffers()
    {
        return $this->hasMany(MarketplaceOffer::class, 'user_id', 'id');
    }

    /**
     * Get all visible marketplace offers to this user
     *
     * @return mixed
     */
    public function visibleMarketplaceOffers()
    {
        $period = settings('marketplace')->offer_cache_period;
        $expires_at = now()->addMinutes($period);
        $key = "user.{$this->id}.visible-marketplace-offers";

        return Cache::store('file')
            ->remember($key, $expires_at, function () {
                return MarketplaceOffer::where('status', true)
                    ->has('walletAccount.user')->get()
                    ->filter(function (MarketplaceOffer $offer) {
                        return $offer->filterByUser($this);
                    })->values();
            });
    }

    /**
     * Get all available trades
     *
     * @return Builder
     */
    public function availableMarketplaceTrades()
    {
        return $this->marketplaceTrades()->has('buyer')->has('seller');
    }

    /**
     * Get all trades
     *
     * @return Builder
     */
    public function marketplaceTrades()
    {
        return MarketplaceTrade::where(function (Builder $query) {
            $query->where('buyer_id', $this->id)->orWhere('seller_id', $this->id);
        });
    }

    /**
     * Get all contacts saved by the instance
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function contacts()
    {
        return $this->belongsToMany(User::class, 'user_contact', 'user_id', 'contact_id')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * Get all users that has saved this instance as contact
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function reverseContacts()
    {
        return $this->belongsToMany(User::class, 'user_contact', 'contact_id', 'user_id')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function trustedBy()
    {
        return $this->reverseContacts()->wherePivot('status', 'trust');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function blockedBy()
    {
        return $this->reverseContacts()->wherePivot('status', 'block');
    }

    /**
     * Can change user role
     *
     * @param User $user
     * @return bool
     */
    public function canChangeRole($user)
    {
        return $this->can('manage_user_roles') && $this->isSuperiorTo($user);
    }

    /**
     * Can edit user
     *
     * @param User $user
     * @return bool
     */
    public function canEdit($user)
    {
        return $this->can('manage_users') || $this->is($user);
    }

    /**
     * Can manage user
     *
     * @param $user
     * @return bool
     */
    public function canManage($user)
    {
        return $this->can('manage_users') && $this->isSuperiorTo($user);
    }

    /**
     * Can interact with platform
     *
     * @return bool
     */
    public function canInteract()
    {
        return !$this->scheduled_deactivate && !$this->scheduled_delete;
    }

    /**
     * Can be deactivated immediately?
     *
     * @return bool
     */
    public function canBeDeactivated()
    {
        return !$this->availableMarketplaceTrades()
            ->whereIn('status', ['active', 'dispute'])
            ->exists();
    }

    /**
     * Can be deleted immediately?
     *
     * @return bool
     */
    public function canBeDeleted()
    {
        return !$this->availableMarketplaceTrades()
            ->whereIn('status', ['active', 'dispute'])
            ->exists();
    }

    /**
     * Check if this user is superior to specified user
     *
     * @param User $user
     * @return bool
     */
    public function isSuperiorTo($user)
    {
        return is_null($user->level()) || $user->level() < $this->level();
    }

    /**
     * User query whom this user is superior to
     *
     * @return Builder
     */
    public function subordinateUsers()
    {
        return User::where('id', '!=', $this->id)
            ->whereDoesntHave('roles', function (Builder $query) {
                $query->where('level', '>=', $this->level());
            });
    }

    /**
     * @return Builder
     */
    public function marketplaceRatings()
    {
        return $this->ratings()->hasMorph('subject', MarketplaceTrade::class)
            ->hasMorph('rater', User::class);
    }

    /**
     * @return float
     */
    public function getAverageMarketplaceRatingAttribute()
    {
        if (!isset($this->averageMarketplaceRatingAttribute)) {
            $average = $this->marketplaceRatings()->avg('rating');
            $this->averageMarketplaceRatingAttribute = round($average, 1);
        }

        return $this->averageMarketplaceRatingAttribute;
    }

    /**
     * @return int
     */
    public function getTotalMarketplaceRatingAttribute()
    {
        if (!isset($this->totalMarketplaceRatingAttribute)) {
            $this->totalMarketplaceRatingAttribute = $this->marketplaceRatings()->count();
        }

        return $this->totalMarketplaceRatingAttribute;
    }


    /**
     * @return \Illuminate\Database\Eloquent\Collection|mixed
     */
    public function getAllContactsAttribute()
    {
        if (!isset($this->allContactsAttribute)) {
            $this->allContactsAttribute = $this->contacts()
                ->wherePivot('status', '!=', 'block')
                ->get();
        }

        return $this->allContactsAttribute;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection|mixed
     */
    public function getTrustedContactsAttribute()
    {
        if (!isset($this->trustedContactsAttribute)) {
            $this->trustedContactsAttribute = $this->contacts()
                ->wherePivot('status', '=', 'trust')
                ->get();
        }

        return $this->trustedContactsAttribute;
    }


    /**
     * Count all users who trust this user as a contact
     *
     * @return int|mixed
     */
    protected function getTrustedByCountAttribute()
    {
        if (!isset($this->trustedByCountAttribute)) {
            $this->trustedByCountAttribute = $this->trustedBy()->count();
        }
        return $this->trustedByCountAttribute;
    }

    /**
     * Count all users who blocked this user
     *
     * @return int|mixed
     */
    protected function getBlockedByCountAttribute()
    {
        if (!isset($this->blockedByCountAttribute)) {
            $this->blockedByCountAttribute = $this->blockedBy()->count();
        }
        return $this->blockedByCountAttribute;
    }

    /**
     * Get authenticated contact pivot
     *
     * @return array|mixed
     */
    protected function getAuthenticatedContactPivotAttribute()
    {
        if (!isset($this->authenticatedContactPivotAttribute)) {
            if (Auth::user() && !Auth::user()->is($this)) {
                $this->authenticatedContactPivotAttribute = Auth::user()->contacts()
                        ->where('name', $this->name)
                        ->first()->pivot ?? new ArrayObject();
            } else {
                $this->authenticatedContactPivotAttribute = new ArrayObject();
            }
        }
        return $this->authenticatedContactPivotAttribute;
    }

    /**
     * Get marketplace trades stats
     *
     * @return array|mixed
     */
    protected function getMarketplaceStatsAttribute()
    {
        if (!isset($this->marketplaceStatsAttribute)) {
            $tradesCount = $this->marketplaceTrades()
                ->select('status', DB::raw('count(*) as total'))->groupBy('status')
                ->get()->pluck('total', 'status');

            $sellingSpeed = $this->marketplaceTrades()
                ->select(DB::raw('TIMESTAMPDIFF(MINUTE, confirmed_at, updated_at) as minutes'))
                ->whereNotNull('confirmed_at')->where('status', 'successful')->where('seller_id', $this->id)
                ->get()->avg('minutes') ?: 0;

            $totalAmountSold = $this->marketplaceTrades()
                ->select('wallet_account_id', DB::raw('SUM(amount) as total_amount'))
                ->where('seller_id', $this->id)->groupBy('wallet_account_id')->get()
                ->map(function ($record) {
                    if (!$account = WalletAccount::find($record->wallet_account_id)) {
                        return false;
                    }
                    $amountObject = coin($record->total_amount, $account->wallet->coin);
                    return [
                        'amount'                 => $amountObject->getValue(),
                        'amount_price'           => $amountObject->getPrice($account->user->currency),
                        'amount_formatted_price' => $amountObject->getFormattedPrice($account->user->currency),
                        'coin'                   => $account->coin,
                    ];
                })->filter();

            $this->marketplaceStatsAttribute = [
                'total_offers'            => $this->marketplaceOffers()->count(),
                'total_active_trades'     => $tradesCount->get('active', 0),
                'total_successful_trades' => $tradesCount->get('successful', 0),
                'total_cancelled_trades'  => $tradesCount->get('cancelled', 0),
                'total_dispute_trades'    => $tradesCount->get('dispute', 0),
                'total_trades'            => $tradesCount->sum(),
                'selling_speed'           => $sellingSpeed,
                'total_amount_sold'       => $totalAmountSold
            ];
        }
        return $this->marketplaceStatsAttribute;
    }

    /**
     * Get notification settings
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function notificationSetting()
    {
        return $this->hasMany(UserNotificationSetting::class, 'user_id', 'id');
    }

    /**
     * Get notification settings
     *
     * @return mixed
     */
    public function getNotificationSettings()
    {
        $defaultSettings = config('notifications.settings');

        if (!isset($this->notificationSettingsAttribute)) {
            $this->updateNotificationSettings();

            $settings = $this->notificationSetting;

            $attribute = $settings->map(function ($data) use ($defaultSettings) {
                $name = $data['name'];

                if (isset($defaultSettings[$name])) {
                    $defaultData = $defaultSettings[$name];

                    foreach ($defaultData as $channel => $status) {
                        if (is_null($status) && isset($data[$channel])) {
                            unset($data[$channel]);
                        }
                    }

                    $data['description'] = trans("notification.{$name}");
                    return $data;
                } else {
                    return null;
                }
            })->filter()->values()->toArray();

            $this->notificationSettingsAttribute = $attribute;
        }

        return $this->notificationSettingsAttribute;
    }

    /**
     * Update user settings
     *
     * @param array $names
     * @return \Illuminate\Database\Eloquent\Collection|void
     */
    protected function updateNotificationSettings()
    {
        $settings = $this->notificationSetting->toArray();
        $names = array_pluck($settings, 'name');

        $defaultSettings = config('notifications.settings');
        $defaultNames = array_keys($defaultSettings);

        $updatedNames = array_diff($defaultNames, $names);
        if (!count($updatedNames)) return;

        $records = collect($updatedNames)->map(function ($name) use ($defaultSettings) {
            return [
                'email'    => (bool) $defaultSettings[$name]['email'],
                'database' => (bool) $defaultSettings[$name]['database'],
                'sms'      => (bool) $defaultSettings[$name]['sms'],
                'name'     => $name,
            ];
        })->toArray();

        $this->notificationSetting()->createMany($records);
    }

    /**
     * Get path for profile picture
     *
     * @return string
     */
    public function profilePicturePath()
    {
        return "profile/{$this->id}/picture";
    }

    /**
     * Get the key used to store phone verification token
     *
     * @return string
     */
    protected function phoneVerificationTokenKey()
    {
        return "user.{$this->id}.phone_verification_token";
    }

    /**
     * Set the phone verification token
     *
     * @return int
     */
    public function generatePhoneVerificationToken()
    {
        $key = $this->phoneVerificationTokenKey();
        $minutes = config('auth.token_expires_in', 5);
        $expires = now()->addMinutes($minutes);

        $token = rand(100000, 999999);

        Cache::put($key, Hash::make($token), $expires);
        return $token;
    }

    /**
     * Confirm phone verification token
     *
     * @param $token
     * @return bool
     */
    public function checkPhoneVerificationToken($token)
    {
        $key = $this->phoneVerificationTokenKey();

        return Cache::has($key) && Hash::check($token, Cache::get($key));
    }

    /**
     * Get the key used to store email verification token
     *
     * @return string
     */
    protected function emailVerificationTokenKey()
    {
        return "user.{$this->id}.email_verification_token";
    }

    /**
     * Confirm email verification token
     *
     * @param $token
     * @return bool
     */
    public function checkEmailVerificationToken($token)
    {
        $key = $this->emailVerificationTokenKey();

        return Cache::has($key) && Hash::check($token, Cache::get($key));
    }

    /**
     * Set the phone verification token
     *
     * @return int
     */
    public function generateEmailVerificationToken()
    {
        $key = $this->emailVerificationTokenKey();
        $minutes = config('auth.token_expires_in', 5);
        $expires = now()->addMinutes($minutes);

        $token = rand(100000, 999999);

        Cache::put($key, Hash::make($token), $expires);
        return $token;
    }

    /**
     * Update authenticated user's presence
     *
     * @param $presence
     * @return User|\Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function updatePresence($presence)
    {
        $currPresence = $this->presence;

        static::withoutEvents(function () use ($presence) {
            $this->fill([
                'presence'     => $presence,
                'last_seen_at' => $this->freshTimestamp(),
            ])->save();
        });

        if ($currPresence != $presence) {
            broadcast(new UserPresenceChanged($this));
        }
        return $this;
    }

    /**
     * Check if user's phone is verified
     *
     * @return \Illuminate\Support\Carbon|mixed|null
     */
    public function isPhoneVerified()
    {
        return $this->phone_verified_at;
    }

    /**
     * Check if user's email is verified
     *
     * @return \Illuminate\Support\Carbon|mixed|null
     */
    public function isEmailVerified()
    {
        return $this->email_verified_at;
    }

    /**
     * Chats where this user is participating
     *
     * @return Chat|Builder
     */
    public function participatingChats()
    {
        return Chat::whereHas('participants', function (Builder $query) {
            $query->where('user_id', $this->id);
        });
    }


    /**
     * Private Participating Chats of this user
     *
     * @return Chat|Builder
     */
    public function privateParticipatingChats()
    {
        return $this->participatingChats()->has('participants', '=', 2);
    }

    /**
     * @param $coinIdentifier
     * @return WalletAccount|null
     */
    public function getWalletAccount($coinIdentifier)
    {
        return $this->walletAccounts()
            ->whereHas('wallet.coin', function (Builder $query) use ($coinIdentifier) {
                $query->where('identifier', $coinIdentifier);
            })->first();
    }

    /**
     * Notifications status
     *
     * @return array
     */
    public function getNotificationsStatus()
    {
        if ($this->notifications_read_at) {
            $recentNotifications = $this->notifications()
                ->where('created_at', '>', $this->notifications_read_at)
                ->whereNull('read_at')
                ->count();
        } else {
            $recentNotifications = $this->notifications()
                ->whereNull('read_at')
                ->count();
        }
        return [
            'recent_notifications' => $recentNotifications
        ];
    }
}
