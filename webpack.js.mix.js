const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const mix = require('laravel-mix');
require('laravel-mix-merge-manifest');

mix.setPublicPath('public');

mix.webpackConfig({
	output : {
		filename      : '[name].js',
		chunkFilename : 'js/chunks/[name].[contenthash].js',
	},

	module : {
		rules : [
			{
				test    : /\.(ogg|mp3)$/i,
				loader  : 'file-loader',
				options : {
					outputPath : 'sounds',
				},
			},
			{
				loader  : 'babel-loader',
				test    : /\.js$/,
				exclude : /node_modules/,
				query   : {
					plugins : ['recharts'],

				}
			}
		],
	},

	resolve : {
		modules : [
			"node_modules",
			path.resolve(__dirname, './resources'),
			path.resolve(__dirname, './resources/modules'),
		],
		alias   : {
			"@ant-design/icons/lib/dist$" : path.resolve(__dirname, "./resources/assets/vendor/antd/icons.js"),
			'react-dom'                   : '@hot-loader/react-dom'
		}
	},

	devtool : process.env.NODE_ENV !== "development" ? false : "source-map",

	devServer : {
		noInfo           : false,
		disableHostCheck : true,
		compress         : false,
		quiet            : false,
	},

	stats : {
		excludeAssets : /^(?!\/?js|css.*$).*/,
		warnings      : false,
	},

	plugins : [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets      : false,
			cleanOnceBeforeBuildPatterns : ["+(js|sounds)/**/*"],
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

mix.js('resources/index.js', 'js');
mix.js('resources/installer/index.js', 'js/installer');
mix.js('resources/admin/index.js', 'js/admin');

mix.js('resources/assets/vendor/broadcast/socket.js', 'vendor');
mix.js('resources/assets/vendor/broadcast/pusher.js', 'vendor');

mix.mergeManifest();

if (mix.inProduction()) {
	mix.version();
}
