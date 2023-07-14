import merge from 'lodash.merge';
import * as path from 'path';
import * as webpack from 'webpack';
import autoprefixer from "autoprefixer";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import sass from "sass"
import fibers from "fibers"
import postcssRTLCSS from 'postcss-rtlcss';
import {BundleAnalyzerPlugin} from "webpack-bundle-analyzer";
// import TerserPlugin from "terser-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import ESLintPlugin from "eslint-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const isAnalyze=false;
const isSpeedMeasure=false;
const isEslint=true;
// const isPostCss=false;


const rtlCssOptions = {  };



function getDefaultOptions(isDevelopment: boolean) {
    let htmlOut=isDevelopment?'../views/index.'+"hbs":'../index.html';
    let htmlOut2=isDevelopment?'../views/index2.'+"hbs":'../index2.html';
    let postCssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: isDevelopment,
            // config: {
            //     path: path.resolve(__dirname, './postcss.config.ts')
            // },
            postcssOptions: {

                plugins: [

                    postcssRTLCSS( rtlCssOptions ), autoprefixer
                ]
            }
        }
    };


    return {
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.(js|jsx|es6)$/,
                    exclude: /node_modules/,
                    loader: 'eslint-loader',
                    options: {
                        quiet: true
                    }
                },
                {
                    test: /\.(js|jsx|es6)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            "exclude": [
                                // \\ for Windows, \/ for Mac OS and Linux
                                /node_modules[\\\/]core-js/,
                                /node_modules[\\\/]webpack[\\\/]buildin/,
                            ],
                            presets: ['@babel/preset-env', '@babel/react'],
                            plugins: ['@babel/plugin-transform-runtime'],

                            // , plugins: []
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader',{
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: false,
                        },
                    }, 'css-loader',  postCssLoader]
                },
                {
                    test: /\.scss$/,
                    include: path.join(__dirname, '../../../jsapp/src'),
                    use: ['style-loader',{
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: false,
                        },
                    }, {
                        loader:'css-loader',
                        options: {
                            sourceMap: isDevelopment}

                    },  postCssLoader, {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDevelopment,
                            implementation: sass,
                            sassOptions: {
                                fiber: fibers,
                            },

                        }
                    }]
                },
                {
                    test: /\.tsx?$/,
                    include: [path.join(__dirname, '../../../jsapp/src'),
                        path.join(__dirname, '../../../csrc')],
                    use: [
                        isDevelopment && {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ["@babel/preset-react", {
                                        "useBuiltIns": "usage",
                                        "corejs": 3
                                    }]
                                ]
                                    ,
                                plugins: ["@babel/plugin-transform-runtime",isDevelopment && 'react-refresh/babel']},
                        }, {
                            loader: 'ts-loader',
                            options: {
                                configFile: "jsapp/tsconfig.json",
                                // disable type checker -  use it in fork plugin
                                transpileOnly: true

                            }
                        },
                    ].filter(Boolean),
                },
                // {
                //     test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)$/,
                //     use: {
                //         loader: 'file-loader',
                //         options: {
                //             name: '[name].[ext]'
                //         }
                //     }
                // }
                {
                    test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)$/,
                    type: 'asset/resource',
                    generator : {
                        filename : '[name][ext][query]',
                    }

                }

            ]
        },
        optimization: {
            minimize: !isDevelopment,
            // minimizer: [new TerserPlugin()],
        },

        plugins: [
            new MiniCssExtractPlugin(),
            isDevelopment && isEslint && new ESLintPlugin({
                files: '../../../jsapp/src/**/*.ts',
            }),
            new ForkTsCheckerWebpackPlugin(),
            isDevelopment && isAnalyze && new BundleAnalyzerPlugin(),
            isDevelopment && new webpack.HotModuleReplacementPlugin(),
            isDevelopment && new ReactRefreshPlugin(),
            new HtmlWebpackPlugin({
                filename: htmlOut,
                template: './src/templates/index.hbs',
            }),
            new HtmlWebpackPlugin({
                filename: htmlOut2,
                template: './src/templates/index2.hbs',
            }),
        ].filter(Boolean),
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.jsx', '.es6'],
        },
    };
}

export function makeWebpackConfig(options: webpack.Configuration, isDevelopment: boolean = false) {
    options = merge(getDefaultOptions(isDevelopment), options || {});
    if (isSpeedMeasure) {
        return smp.wrap( options );
    } else {
        return options
    }
}