<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\Resource;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
	/**
	 * Register any application services.
	 *
	 * @return void
	 */
	public function register()
	{
		$this->registerPlugins();
	}

	/**
	 * Bootstrap any application services.
	 *
	 * @return void
	 */
	public function boot()
	{
		$this->bootDatabase();
		$this->bootResource();
	}

	/**
	 * Boot database schema
	 *
	 * @return void
	 */
	private function bootDatabase()
	{
		Schema::defaultStringLength(191);
	}

	/**
	 * Boot resource
	 *
	 * @return void
	 */
	private function bootResource()
	{
		Resource::withoutWrapping();
	}

	/**
	 * Register plugins
	 *
	 * @return void
	 */
	private function registerPlugins()
	{
		$pluginDirs = File::directories(base_path('app/Plugins'));

		foreach ($pluginDirs as $pluginDir) {
			$class = "App\\Plugins\\" . basename($pluginDir) . "\\PluginServiceProvider";

			if (class_exists($class) && is_subclass_of($class, ServiceProvider::class)) {
				$this->app->register($class);
			}
		}
	}
}
