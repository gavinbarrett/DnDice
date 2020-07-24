module.exports = {
	entry: './src/App.jsx',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			}
		]
	},
	resolve: {
		extensions: ['*', '.js', '.jsx']
	},
	output: {
		filename: 'App.js',
		path: __dirname + '/dist',
	},
};
