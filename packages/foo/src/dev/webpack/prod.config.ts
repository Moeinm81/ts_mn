import * as path from 'path';
import * as webpack from 'webpack';
import {makeWebpackConfig}  from "./webpack.common"
const config: webpack.Configuration = makeWebpackConfig({
    mode:  'production',
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    entry: {
        app: ['./jsapp/src/index.tsx'],
    },
    output: {
        filename: '[name]-[contenthash].js',
        path: path.resolve(__dirname, '../../../out/static/static'),
        publicPath: '/static/',
    },
    // mainly for hiding stylelint output
    stats: {
        all: false,
        // maxModules: 0,
        errors: true,
        errorDetails: true
    }
});

export default config;