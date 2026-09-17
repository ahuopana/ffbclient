const path = require('path');
const webpack = require('webpack');
const buildPath = path.join(__dirname, "build");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './app.ts',
    output: {
        filename: '[name]-[contenthash].js',
        library: 'EntryPoint',
        path: buildPath,
        clean: true
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.FFB_SERVER_HOST': JSON.stringify(process.env.FFB_SERVER_HOST || ''),
            'process.env.FFB_SERVER_PORT': JSON.stringify(process.env.FFB_SERVER_PORT || ''),
            'process.env.FFB_SERVER_PROTO': JSON.stringify(process.env.FFB_SERVER_PROTO || '')
        }),
        new HtmlWebpackPlugin({ title: "ffbclient", template: "index.html" })
    ],
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            }
        ]
    },
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        allowedHosts: 'all',
        setupMiddlewares: (middlewares, devServer) => {
            const api = require("./fumbblapi");
            devServer.app.get("/matches", (req, res) => {
                api.get_current_matches(res);
            });
            devServer.app.get("/auth", (req, res) => {
                api.authenticate(res);
            });
            return middlewares;
        }
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    }
};
