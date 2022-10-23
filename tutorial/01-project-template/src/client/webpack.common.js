const path = require("path");

module.exports = {
    entry: "./src/client/chainsynth.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../../dist/client"),
    },
};