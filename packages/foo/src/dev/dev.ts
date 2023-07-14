// eslint-disable-next-line import/no-extraneous-dependencies
import express from "express";
// eslint-disable-next-line import/no-extraneous-dependencies
import webpack from "webpack";
import config from "./webpack/dev.server";
// eslint-disable-next-line import/no-extraneous-dependencies
import webpackDevMiddleware from "webpack-dev-middleware";
// eslint-disable-next-line import/no-extraneous-dependencies
import webpackHotMiddleware from "webpack-hot-middleware";
// eslint-disable-next-line import/no-extraneous-dependencies
import hbs from "handlebars";

const compiler: webpack.Compiler = webpack(config);
const publicPath: string = config.output?.publicPath as string;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const instance = webpackDevMiddleware(compiler, {
  publicPath,
  serverSideRender: true,
  writeToDisk: false,
});

export function devtools(app: express.Application) {
  app.use(instance as any);
  instance.waitUntilValid(() => {
    // tslint:disable-next-line:no-console
    console.log("Package is in a valid state");
  });
  app.use(
    webpackHotMiddleware(compiler, {
      // log: false,
      log: undefined,
      path: `/__webpack_hmr`,
      heartbeat: 10 * 1000,
    }) as any
  );
  app.engine("hbs", (filePath: string, options: object, callback: any) => {
    // define the template engine
    const memoryFs = compiler.outputFileSystem;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    memoryFs.readFile(filePath, "utf-8", (err, content) => {
      if (err) {
        return callback(err);
      }
      // this is an extremely simple template engine
      const rendered = hbs.compile(content)(options);

      return callback(null, rendered);
    });
  });
}
