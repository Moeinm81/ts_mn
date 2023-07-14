#!/usr/bin/env node

import path from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import express from "express";

// eslint-disable-next-line import/no-extraneous-dependencies
import { program } from "commander";

const configPath = path.join("..", "src", "config");
const app = express();

program
  .option("-r, --route <route>", "Specify the route")
  .option("-h, --handlers <handlers>", "Specify the handlers");

program.parse(process.argv);
const { route, handlers } = program.opts();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addNewProxy() {
  try {
    import(configPath).then((module) => {
      // app.use("/new-proxy", module.newProxyMiddleware as never);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addNewProxy1() {
  try {
    if (route && handlers) {
      import(configPath).then((module) => {
        app.use(route, module.getNormalProxyforUrl(handlers) as never);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function run() {
  try {
    import(configPath).then((module) => {
      app.use("/presto", module.prestoProxy as any); // .....................
      app.use("/presto", module.prestoProxy as any);
      app.use("/grafana", module.grafanaProxy as any);
      app.use("/project", module.prestoProxy as any);
      // eslint-disable-next-line camelcase
      app.use("/api", module.api_server as never);
      app.use("/", module.getNormalProxyforUrl(module.pardazaServer) as never);
      addNewProxy1();
      addNewProxy();
    });
    const port = 3050;
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`running Server port : ${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

run();

/*


function addNewProxy() {
  try {
    import(configPath).then((module) => {
      // اضافه کردن پروکسی جدید با مسیر و میانجی‌گر مربوطه
      app.use("/new-proxy", module.newProxyMiddleware as never);
    });
    // ادامه بقیه قسمت‌ها
    // ...
  } catch (error) {
    console.error(error);
  }
}


function run() {
  try {
    import(configPath).then((module) => {
      app.use("/presto", module.prestoProxy as never);
      app.use("/grafana", module.grafanaProxy as never);
      app.use("/project", module.prestoProxy as never);
      app.use("/api", module.api_server as never);
      app.use("/", module.getNormalProxyforUrl(module.pardazaServer) as never);
      addNewProxy(); // اضافه کردن پروکسی جدید
    });
    const port = 3012;
    app.listen(port, () => {
      console.log(Running Server, port: ${port});
    });
  } catch (error) {
    console.error(error);
  }
}

*/
