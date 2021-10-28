const path = require('path');
const LessThemePlugin = require('./modules/extract-less');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const mix = require('laravel-mix');
require('laravel-mix-merge-manifest');

mix.setPublicPath('public');

mix.webpackConfig({
	output : {
		filename      : '[name].js',
	},

	resolve : {
		modules : [
			"node_modules",
			path.resolve(__dirname, './resources'),
		],
	},

	devtool : process.env.NODE_ENV !== "development" ? false : "source-map",

	devServer : {
		noInfo   : false,
		disableHostCheck : true,
		compress : false,
		quiet    : false,
	},

	stats : {
		excludeAssets : /^(?!\/?js|css.*$).*/,
		warnings      : false,
	},

	plugins : [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets      : false,
			cleanOnceBeforeBuildPatterns : ["+(css|fonts|less)/**/*"],
		}),
		new LessThemePlugin({
			mixinFiles     : [
				path.join(__dirname, "resources/styles/mixin.less"),
			],
			themeVariables : [
				'@primary-color',
				'@secondary-color',
				'@heading-color',
				'@layout-header-background',
				'@layout-footer-background',
				'@hor-nav-text-color',
				'@nav-dark-bg',
				'@nav-bar-bg',
				'@nav-dark-text-color',
				'@body-background',
				'@menu-item-active-border-width',
				'@slider-handle-border-width',
				'@border-style-base',
				'@border-width-base'
			],
			source         : path.join(__dirname, 'resources/styles/index.less'),
			output         : 'less/index.less',
		}),
		new LessThemePlugin({
			mixinFiles     : [
				path.join(__dirname, "resources/styles/mixin.less"),
			],
			themeVariables : [
				'@primary-color',
				'@secondary-color',
				'@heading-color',
				'@layout-header-background',
				'@layout-footer-background',
				'@hor-nav-text-color',
				'@nav-dark-bg',
				'@nav-bar-bg',
				'@nav-dark-text-color',
				'@body-background',
				'@menu-item-active-border-width',
				'@slider-handle-border-width',
				'@border-style-base',
				'@border-width-base'
			],
			source         : path.join(__dirname, 'resources/styles/dark.less'),
			output         : 'less/dark.less',
		}),
	],
});


/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.less('resources/styles/index.less', 'css');
mix.less('resources/styles/dark.less', 'css');

mix.sass("resources/assets/vendor.scss", 'css');

mix.mergeManifest();

if (mix.inProduction()) {
	mix.version();
}
