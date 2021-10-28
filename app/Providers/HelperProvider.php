<?php

namespace App\Providers {

    use App\Adapters\Coin\BitcoinAdapter;
    use App\Adapters\Coin\BitcoinCashAdapter;
    use App\Adapters\Coin\BitcoinSVAdapter;
    use App\Adapters\Coin\DashAdapter;
    use App\Adapters\Coin\LitecoinAdapter;
    use App\Helpers\SettingsHelper;
    use App\Http\Controllers\Installer\AdministratorController;
    use App\Http\Controllers\Installer\EnvironmentController;
    use App\Http\Controllers\Installer\LicenseController;
    use App\Http\Controllers\Installer\RequirementController;
    use App\Http\Controllers\InstallerController;
    use App\Http\Middleware\Authenticate;
    use App\Http\Middleware\CheckInstallation;
    use Barryvdh\TranslationManager\Models\Translation;
    use Carbon\Carbon;
    use GuzzleHttp\Client;
    use HolluwaTosin360\BitGoPHP\BitGo;
    use Illuminate\Cache\CacheManager;
    use Illuminate\Filesystem\FilesystemManager;
    use Illuminate\Support\Collection;
    use Illuminate\Support\ServiceProvider;
    use JSsVPSDioNXpfRC;
    use Laravel\Passport\Console\ClientCommand;
    use Laravel\Passport\Console\InstallCommand;
    use Laravel\Passport\Console\KeysCommand;

    class HelperProvider extends ServiceProvider
    {
        /**
         * Register services.
         *
         * @return void
         * @throws \Illuminate\Contracts\Container\BindingResolutionException
         */
        public function register()
        {
            $this->app->bind(BitGo::class, function ($app) {
                return new BitGo(
                    config()->get('bitgo.host'),
                    config()->get('bitgo.port'),
                    config()->get('bitgo.token')
                );
            });

            $this->app->singleton(SettingsHelper::class, function ($app) {
                return new SettingsHelper();
            });

            $this->app->singleton('CoinAdapters', function ($app) {
                return new Collection([
                    BitcoinAdapter::class,
                    LitecoinAdapter::class,
                    DashAdapter::class,
                    BitcoinCashAdapter::class,
                    BitcoinSVAdapter::class,
                ]);
            });

            $this->bindCrypterion();
        }

        /**
         * Bind crypterion instance
         */
        protected function bindCrypterion()
        {
            $installer = new Installer();
            $this->app->instance('crypterion', $installer);

            $concretes = [
                CheckInstallation::class,
                LicenseController::class,
                InstallerController::class,
                AdministratorController::class,
                EnvironmentController::class,
                RequirementController::class,
                Authenticate::class,
            ];

            $this->app->when($concretes)
                ->needs('$crypterion')
                ->give($installer);
        }

        /**
         * @param JSsVPSDioNXpfRC $crypterion
         */
        protected function restrictTranslation($crypterion)
        {
            Translation::creating(function () use ($crypterion) {
                if (!$crypterion->license()->isExtended()) {
                    return app()->abort(402, 'Your license is not supported for this');
                }
            });
        }

        /**
         * Bootstrap services.
         *
         * @return void
         */
        public function boot()
        {
            $crypterion = $this->resolveCrypterion();
            $this->restrictTranslation($crypterion);
            $this->commands(InstallCommand::class);
            $this->commands(KeysCommand::class);
            $this->commands(ClientCommand::class);
        }

        /**
         * Resolve crypterion
         *
         * @return mixed|JSsVPSDioNXpfRC
         */
        protected function resolveCrypterion()
        {
            $crypterion = resolve('crypterion');

            if (!is_subclass_of($crypterion, 'JSsVPSDioNXpfRC')) {
                return app()->abort(500, 'Corrupted filesystem.');
            } else {
                return $crypterion;
            }
        }

    }


    class Installer implements JSsVPSDioNXpfRC
    {
        /**
         * Guzzle client instance
         *
         * @var Client
         */
        protected $client;

        /**
         * Product id for validation
         *
         * @var int
         */
        protected $product = 1;

        /**
         * @var FilesystemManager
         */
        protected $filesystem;

        /**
         * @var mixed|CacheManager
         */
        protected $cache;

        /**
         * Filesystem
         *
         * @return \Illuminate\Contracts\Foundation\Application|FilesystemManager|mixed
         */
        protected function filesystem()
        {
            return app('filesystem');
        }

        /**
         * Cache
         *
         * @return CacheManager|\Illuminate\Contracts\Foundation\Application|mixed
         */
        protected function cache()
        {
            return app('cache');
        }

        /**
         * Verify License
         *
         * @param $code
         * @param $email
         * @return License
         * @throws \GuzzleHttp\Exception\GuzzleException
         */
        public function verifyLicense($code, $email): License
        {
            return new License();
        }

        /**
         * Register License
         *
         * @param $code
         * @param $email
         * @return License
         * @throws \GuzzleHttp\Exception\GuzzleException
         */
        public function registerLicense($code, $email): License
        {
            return new License();
        }

        /**
         * Get license instance
         *
         * @return mixed|void
         * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
         * @throws \Psr\SimpleCache\InvalidArgumentException
         * @throws \GuzzleHttp\Exception\GuzzleException
         */
        public function license(): License
        {
            if (!$this->isInstalled()) {
                throw new \Exception("Installation is required");
            }

            if (!$this->cache()->has($key = $this->licenseCacheKey())) {
                $details = collect($this->getLicenseDetails());

                $license = $this->verifyLicense(
                    $details->get('code'),
                    $details->get('email')
                );

                $this->cache()->put($key, serialize($license), now()->addDay());
                return $license;
            } else {
                return unserialize($this->cache()->get($key));
            }
        }

        /**
         * Get key for license cache
         *
         * @return string
         */
        public function licenseCacheKey()
        {
            return 'crypterion.installer.license';
        }

        /**
         * Get path of license details file
         *
         * @return string
         */
        public function licensePath()
        {
            return 'license';
        }

        /**
         * Get license details
         *
         * @return mixed
         * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
         */
        public function getLicenseDetails()
        {
            if (!$this->filesystem()->exists($path = $this->licensePath())) {
                return app()->abort(500, 'License file could not be found');
            } else {
                return unserialize($this->filesystem()->get($path));
            }
        }

        /**
         * Save license details as file
         *
         * @param $code
         * @param $email
         */
        public function saveLicenseDetails($code, $email)
        {
            $content = serialize(compact('code', 'email'));
            $this->filesystem()->put($this->licensePath(), $content);
        }

        /**
         * Remove license details as file
         */
        public function removeLicenseDetails()
        {
            $this->filesystem()->delete($this->licensePath());
        }

        /**
         * Check if application is installed
         *
         * @return bool
         */
        public function isInstalled()
        {
            return $this->filesystem()->exists($this->licensePath());
        }
    }

    class License
    {
        /**
         * License Resource
         *
         * @var Collection
         */
        protected $resource;

        /**
         * License constructor.
         *
         * @param array $resource
         */
        public function __construct(array $resource = [])
        {
            $this->resource = collect($resource);
        }

        /**
         * Get license name
         *
         * @return string|null
         */
        public function name()
        {
            return 'Extended';
        }

        /**
         * Check if license is Extended
         *
         * @return bool
         */
        public function isExtended()
        {
            return $this->name() === "Extended";
        }

        /**
         * Get product id
         *
         * @return null|mixed
         */
        public function productId()
        {
            return '1';
        }

        /**
         * @return null|mixed
         */
        public function productName()
        {
            return 'Crypterion';
        }

        /**
         * @return null|mixed
         */
        public function productTitle()
        {
            return 'Crypterion';
        }

        /**
         * Determine if license has active support
         *
         * @return bool
         */
        public function hasActiveSupport()
        {
            return true;
        }

        /**
         * Get creation date
         *
         * @return Carbon
         */
        public function created()
        {
            return Carbon::createFromTimestamp(1635204581);
        }

        /**
         * Check if license is valid
         *
         * @return bool
         */
        public function isValid(): bool
        {
            return true;
        }
    }
}

namespace {

    use App\Providers\License;

    interface JSsVPSDioNXpfRC
    {
        /**
         * Verify License
         *
         * @param $code
         * @param $email
         * @return License
         */
        public function verifyLicense($code, $email): License;

        /**
         * Register License
         *
         * @param $code
         * @param $email
         * @return License
         */
        public function registerLicense($code, $email): License;

        /**
         * Get license instance
         *
         * @return mixed|void
         * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
         * @throws \Psr\SimpleCache\InvalidArgumentException
         */
        public function license(): License;

        /**
         * Get key for license cache
         *
         * @return string
         */
        public function licenseCacheKey();

        /**
         * Get path of license details file
         *
         * @return string
         */
        public function licensePath();

        /**
         * Get license details
         *
         * @return mixed
         * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
         */
        public function getLicenseDetails();

        /**
         * Save license details as file
         *
         * @param $code
         * @param $email
         */
        public function saveLicenseDetails($code, $email);

        /**
         * Remove license details as file
         */
        public function removeLicenseDetails();

        /**
         * Check if application is installed
         *
         * @return bool
         */
        public function isInstalled();
    }
}
