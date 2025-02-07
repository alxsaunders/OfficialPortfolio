const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const path = require('path')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'development',
        devServer: {
            host: 'localhost',
            port: 3000,
            open: true,
            hot: true,
            watchFiles: ['src/**', 'static/**'],
            static: {
                watch: true,
                directory: path.join(__dirname, '../static')
            }
        }
    }
)