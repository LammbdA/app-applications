const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CircularDependencyPlugin = require('circular-dependency-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const path = require('path');
const fs = require('fs');
const CompressionPlugin = require("compression-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const zlib = require("zlib");

const swcConfig = JSON.parse(fs.readFileSync('./.swcrc'));

const isProd = process.env.NODE_ENV === 'production';

const input = path.join(__dirname, '/src/main/resources/assets');
const output = path.join(__dirname, '/build/resources/main/assets');

module.exports = {
    context: input,
    entry: {
        'js/bundle': './js/main.ts',
        'styles/main': './styles/main.less',
    },
    output: {
        path: output,
        filename: './[name].js',
        assetModuleFilename: './[file]'
    },
    resolve: {
        extensions: ['.ts', '.js', '.less', '.css']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
                exclude: [
                    path.resolve(__dirname, 'node_modules/fine-uploader/'),
                ],
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'swc-loader',
                        options: {
                            ...swcConfig,
                            sourceMaps: isProd ? false : 'inline',
                            inlineSourcesContent: !isProd,
                        },
                    },
                ],
            },
            {
                test: /\.less$/,
                use: [
                    {loader: MiniCssExtractPlugin.loader, options: {publicPath: '../'}},
                    {loader: 'css-loader', options: {sourceMap: !isProd, importLoaders: 1}},
                    {loader: 'postcss-loader', options: {sourceMap: !isProd}},
                    {loader: 'less-loader', options: {sourceMap: !isProd}},
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ],
    },
    plugins: [
        new ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: './styles/[id].css'
        }),
        new CircularDependencyPlugin({
            exclude: /a\.js|node_modules/,
            failOnError: true
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: path.join(input, 'icons/favicons'), to: path.join(output, 'icons/favicons')},
                {from: path.join(input, 'icons'), to: path.join(output, 'icons')},
            ],
        }),
        ...(isProd ?  [
                new CompressionPlugin({
                    test: /\.(js|css|svg|ttf|json|ico)$/,
                    algorithm: "gzip",
                    minRatio: Number.MAX_SAFE_INTEGER,
                }),
                new CompressionPlugin({
                    test: /\.(js|css|svg|ttf|json|ico)$/,
                    algorithm: "brotliCompress",
                    compressionOptions: {
                        params: {
                            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                        },
                    },
                    minRatio: Number.MAX_SAFE_INTEGER,
                }),
            ] : []
        ),
    ],
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'source-map',
    performance: {hints: false}
};
