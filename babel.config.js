module.exports = {
	presets: [
		"@babel/preset-env",
		"@babel/preset-react"
	],
	plugins: [
		"react-hot-loader/babel",
		"@babel/plugin-proposal-class-properties",
		"@babel/plugin-syntax-dynamic-import",
		"@babel/plugin-proposal-object-rest-spread",
		"recharts",
		[
			"import",
			{
				"libraryName": "lodash",
				"libraryDirectory": "",
				"camel2DashComponentName": false
			},
			'lodash'
		],
		[
			"import",
			{
				"libraryName": "antd",
				"libraryDirectory": "lib",
				"style": false,
			},
			'antd'
		],
		[
			"react-intl",
			{
				"messagesDir": './resources/messages'
			}
		]
	]
};