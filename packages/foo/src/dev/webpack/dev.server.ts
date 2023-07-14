import * as path from "path";
import * as webpack from "webpack";
import { makeWebpackConfig } from "./webpack.common";

const ansiColors = {
  red: "00FF00", // note the lack of "#"
};
let overlayStyles = {
  color: "#FF0000", // note the inclusion of "#" (these options would be the equivalent of div.style[option] = value)
};
let hotMiddlewareScript =
  `webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true&ansiColors=${ 
  encodeURIComponent(JSON.stringify(ansiColors)) 
  }&overlayStyles=${ 
  encodeURIComponent(JSON.stringify(overlayStyles))}`;

const speedMeasure = false;

let config: webpack.Configuration = makeWebpackConfig(
  {
    mode: "development",
    devtool: "source-map",
    optimization: {
      // moduleIds: 'named',
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
    entry: {
      app: [
        /*'webpack-hot-middleware/client',*/ hotMiddlewareScript,
        "./jsapp/src/index.tsx",
      ],
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../../../src/jsapp"),
      publicPath: "/static/",
      // hotUpdateChunkFilename: '[id].hot-update.js',
      // hotUpdateMainFilename: 'hot-update.json'
    },
    stats: {
      errorDetails: true,
    },
  },
  true
);

if (speedMeasure) {
  const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
  const smp = new SpeedMeasurePlugin();
  config = smp.wrap(config);
}

export default config;
