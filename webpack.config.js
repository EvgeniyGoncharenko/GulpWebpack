let path = require('path');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, './build/js'),
        filename: 'main.js'
    },
    plugins: [],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: '/node_modules/'
            }
        ]
    },
    devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : false  
  } 

