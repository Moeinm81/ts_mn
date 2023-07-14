/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
import http from "http";
import { ClientRequest } from "http";
// eslint-disable-next-line import/no-extraneous-dependencies
import { createProxyMiddleware } from "http-proxy-middleware";
import { IncomingMessage, ServerResponse } from "http";
import url from "url";

export const pardazaServer = "https://app.pardaza.ir";
const prestoServer = "http://172.16.52.20:8080";
const serverUrl = "https://app.pardaza.ir"; // TODO remove

const authServer = "https://app.pardaza.ir";
const rmServer = "https://app.pardaza.ir";
// let prestoServer="https://app.pardaza.ir"
const grafanaServer = "https://app.pardaza.ir";

export function getNormalProxyforUrl(url: string) {
  return createProxyMiddleware({
    target: url,
    changeOrigin: true,
    onProxyReq(proxyReq, req: any) {
      if (req.user) {
        // proxyReq.setHeader('X-Forwarded-Proto', 'http');
        // proxyReq.setHeader('X-Forwarded-Host', 'localhost');
        // proxyReq.setHeader('X-Forwarded-Port', '8080');
        proxyReq.setHeader("authorization", `Bearer ${req.user.accessToken}`);
      }
    },
  });
}

export const prestoProxy = createProxyMiddleware({
  target: prestoServer,
  changeOrigin: true,
  headers: {
    Connection: "keep-alive",
  },
  pathRewrite: {
    "^/presto": "", // remove base path
  },
  onProxyReq(proxyReq, req: any, res) {
    // proxyReq.setHeader('X-Forwarded-Proto', 'http');
    // proxyReq.setHeader('X-Forwarded-Host', 'localhost');
    // proxyReq.setHeader('X-Forwarded-Port', '8080');
    // proxyReq.setHeader('Host', serverUrl);
    proxyReq.setHeader("authorization", `Bearer${req.user.accessToken}`);
    proxyReq.setHeader("Host", "localhost:8080");
    proxyReq.setHeader("X-Presto-UserHost", "admin");
  },
  proxyTimeout: 5000,
  onError(err, req, res, target) {
    console.log(err);
  },
});

export const grafanaProxy = createProxyMiddleware({
  target: grafanaServer,
  changeOrigin: true,
  headers: {
    Connection: "keep-alive",
  },
  onProxyReq(proxyReq, req: any) {
    proxyReq.setHeader("X-Forwarded-For", "127.0.0.1");
    proxyReq.setHeader("X-Forwarded-Proto", "http");

    if (req.user) {
      proxyReq.setHeader("X-WEBAUTH-USER", req.user.username);
      proxyReq.setHeader("X-WEBAUTH-ROLE", "Admin");
    }
    proxyReq.setHeader("Host", serverUrl);
  },
  proxyTimeout: 5000,
  onError(err, req, res, target) {
    console.log(err);
  },
});

export const projectProxy = createProxyMiddleware({
  target: "http://127.0.0.1:8000",
  changeOrigin: true,
  headers: {
    Connection: "keep-alive",
  },
  onProxyReq(proxyReq, req: any, res) {
    proxyReq.setHeader("X-Forwarded-For", "127.0.0.1");
    proxyReq.setHeader("X-Forwarded-Proto", "http");
    proxyReq.setHeader("Host", serverUrl);
    proxyReq.setHeader("authorization", `Bearer ${req.user.accessToken}`);
  },
  proxyTimeout: 5000,
  onError(err, req, res, target) {
    console.log(err);
  },
});

// eslint-disable-next-line camelcase
export const api_server = createProxyMiddleware({
  target: rmServer,
  changeOrigin: true,
  onProxyReq(proxyReq, req: any, res) {
    if (req.user) {
      // getNewToken().then(value => {
      // proxyReq.setHeader('X-Forwarded-For', 'localhost:8080');
      proxyReq.setHeader("X-Forwarded-Proto", "http");
      proxyReq.setHeader("X-Forwarded-Host", "localhost");
      proxyReq.setHeader("X-Forwarded-Port", "8080");
      // proxyReq.setHeader('Host', serverUrl);
      proxyReq.setHeader("authorization", `Bearer ${req.user.accessToken}`);
    }
  },
});

export const simpleProxy = createProxyMiddleware({
  target: authServer,
  changeOrigin: true,
  headers: {
    Connection: "keep-alive",
  },
  onProxyReq(proxyReq, req, res) {
    proxyReq.setHeader("X-Forwarded-For", "127.0.0.1");
    proxyReq.setHeader("X-Forwarded-Proto", "http");
    proxyReq.setHeader("Host", "localhost");
  },
  proxyTimeout: 5000,
  onError(err, req, res, target) {
    console.log(err);
  },
});
