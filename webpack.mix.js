const rimraf = require('rimraf');
if(['js', 'css'].includes(process.env.npm_config_section)){
	rimraf.sync('./public/mix-manifest.json');
}

if(['server'].includes(process.env.npm_config_section)){
	rimraf.sync('./public/server/mix-manifest.json');
}

if (['js', 'css', 'server'].includes(process.env.npm_config_section)) {
	require(`${__dirname}/webpack.${process.env.npm_config_section}.mix.js`)
} else {
	throw new Error('Invalid section argument!')
}