// process.env is replaced at build time by webpack.DefinePlugin (see webpack.config.js);
// this is not a real Node process, just the subset of keys we inject.
declare const process: {
    env: {
        NODE_ENV: string;
        FFB_SERVER_HOST: string;
        FFB_SERVER_PORT: string;
        FFB_SERVER_PROTO: string;
    };
};
