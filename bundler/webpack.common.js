const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
    entry: path.resolve(__dirname, '../src/script.js'),
    output: {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') },
                { 
                    from: path.resolve(__dirname, '../src/images'), 
                    to: 'images',
                    noErrorOnMissing: true 
                }
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            minify: true
        })
    ],
    module: {
        rules: [
            // HTML
            {
                test: /\.(html)$/,
                use: ['html-loader']
            },

            // JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },

            // CSS
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },

            // Images
            {
                test: /\.(jpg|png|gif|svg)$/,
                type: 'asset/resource'
            },

            // Web manifest and other assets
            {
                test: /\.(webmanifest|ico)$/,
                type: 'asset/resource'
            },

            // Shaders
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                type: 'asset/source',
                generator: {
                    filename: 'assets/shaders/[hash][ext]'
                }
            }
        ]
    }
}