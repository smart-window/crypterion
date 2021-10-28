<?php

namespace App\Http\Controllers;

use App\Helpers\LocaleManager;
use App\Helpers\RouteGenerator\RouteGenerator;
use ArrayObject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IndexController extends Controller
{
	/**
	 * @var RouteGenerator
	 */
	protected $routeManager;

	/**
	 * @var LocaleManager
	 */
	protected $localeManager;

	/**
	 * IndexController constructor.
	 * @param RouteGenerator $routeGenerator
	 * @param LocaleManager $localeManager
	 */
	public function __construct(RouteGenerator $routeGenerator, LocaleManager $localeManager)
	{
		$this->routeManager = $routeGenerator;
		$this->localeManager = $localeManager;
	}

	/**
	 * @param Request $request
	 * @return \Illuminate\View\View
	 */
	public function view()
	{
		$palettes = $this->getColorPalettes();

		$data = [
			'name'         => config('app.name'),
			'faviconUrl'   => settings('brand')->favicon_url,
			'logoDarkUrl'  => settings('brand')->logo_dark_url,
			'logoUrl'      => settings('brand')->logo_url,
			'logoIconUrl'  => settings('brand')->logo_icon_url,
			'broadcast'    => $this->getBroadcastConfig(),
			'auth'         => [
				'user'           => $this->getUser(),
				'superAdminRole' => config('permission.super_admin_role')
			],
			'page'         => [
				'footer' => settings('page')->footer,
			],
			'settings'     => [
				'colorPalettes'    => $palettes,
				'navStyle'         => settings('template')->nav_style,
				'layoutType'       => settings('template')->layout_type,
				'themeType'        => settings('template')->theme_type,
				'recaptcha'        => [
					'enable'  => config('recaptcha.enable'),
					'sitekey' => config('recaptcha.sitekey'),
					'type'    => config('recaptcha.type'),
				],
				'supportedLocales' => $this->getSupportedLocales(),
			],
			'authUsername' => getAuthUsername(),
			'csrfToken'    => csrf_token(),
			'routeData'    => $this->routeManager->generate('index'),
		];

		$body = ssr(public_path('server/js/server.js'))
			->context('app', $data)
			->context('url', request()->getRequestUri())
			->render();

		if (is_array($body)) {
			if (isset($body['redirect']) && ($redirect = $body['redirect'])) {
				return redirect()->to($redirect['url'], $redirect['status']);
			}
			$body = null;
		}

		return view('index', compact('data', 'body', 'palettes'));
	}

	/**
	 * Get user object
	 *
	 * @return \App\Models\User|ArrayObject|\Illuminate\Contracts\Auth\Authenticatable
	 */
	protected function getUser()
	{
		return Auth::check() ? Auth::user()
			->updatePresence("online") :
			new ArrayObject();
	}

	/**
	 * Get supported locales object
	 *
	 * @return ArrayObject
	 */
	protected function getSupportedLocales()
	{
		return new ArrayObject($this->localeManager->getSupportedLocalesData());
	}

	/**
	 * Get color palettes object
	 *
	 * @return ArrayObject
	 */
	protected function getColorPalettes()
	{
		return settings('template')->color_palettes;
	}

	/**
	 * Get event broadcasting config
	 *
	 * @return array
	 */
	protected function getBroadcastConfig()
	{
		$connection = [];
		$config = config('broadcasting');
		$driver = $config['default'];

		if ($driver == 'pusher') {
			$pusher = $config['connections'][$driver];
			$connection['options'] = $pusher['options'];
			$connection['key'] = $pusher['key'];
		}

		return [
			'connection' => new ArrayObject($connection),
			'driver'     => $driver,
		];
	}

    /**
     * Get IP Info
     *
     * @param Request $request
     * @return array
     */
	public function ipInfo(Request $request)
    {
        return geoip($request->ip())->toArray();
    }
}
