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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onProxyReq(
      proxyReq: { setHeader: (arg0: any, arg1: any) => void },
      req: any
    ) {
      if (req.user) {
        // proxyReq.setHeader('X-Forwarded-Proto', 'http');
        // proxyReq.setHeader('X-Forwarded-Host', 'localhost');
        // proxyReq.setHeader('X-Forwarded-Port', '8080');
        proxyReq.setHeader("authorization", `Bearer ${req.user.accessToken}`);
      }
    },
  } as any);
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
  onProxyReq(
    proxyReq: { setHeader: (arg0: string, arg1: string) => void },
    req: any,
    res: any
  ) {
    // proxyReq.setHeader('X-Forwarded-Proto', 'http');
    // proxyReq.setHeader('X-Forwarded-Host', 'localhost');
    // proxyReq.setHeader('X-Forwarded-Port', '8080');
    // proxyReq.setHeader('Host', serverUrl);
    proxyReq.setHeader("authorization", `Bearer${req.user.accessToken}`);
    proxyReq.setHeader("Host", "localhost:8080");
    proxyReq.setHeader("X-Presto-UserHost", "admin");
  },
  proxyTimeout: 5000,
  onError(err: any) {
    console.log(err);
  },
} as any);

export const grafanaProxy = createProxyMiddleware({
  target: grafanaServer,
  changeOrigin: true,
  headers: {
    Connection: "keep-alive",
  },
  onProxyReq(
    proxyReq: { setHeader: (arg0: string, arg1: string) => void },
    req: any
  ) {
    proxyReq.setHeader("X-Forwarded-For", "127.0.0.1");
    proxyReq.setHeader("X-Forwarded-Proto", "http");

    if (req.user) {
      proxyReq.setHeader("X-WEBAUTH-USER", req.user.username);
      proxyReq.setHeader("X-WEBAUTH-ROLE", "Admin");
    }
    proxyReq.setHeader("Host", serverUrl);
  },
  proxyTimeout: 5000,
  onError(err: any) {
    console.log(err);
  },
} as any);

export const projectProxy = createProxyMiddleware({
  target: "http://127.0.0.1:8000",
  changeOrigin: true,
  headers: {
    Connection: "keep-alive",
  },
  onProxyReq(
    proxyReq: { setHeader: (arg0: string, arg1: string) => void },
    req: any,
    res: any
  ) {
    proxyReq.setHeader("X-Forwarded-For", "127.0.0.1");
    proxyReq.setHeader("X-Forwarded-Proto", "http");
    proxyReq.setHeader("Host", serverUrl);
    proxyReq.setHeader("authorization", `Bearer ${req.user.accessToken}`);
  },
  proxyTimeout: 5000,
  onError(err: any) {
    console.log(err);
  },
} as any);

// eslint-disable-next-line camelcase
export const api_server = createProxyMiddleware({
  target: rmServer,
  changeOrigin: true,
  onProxyReq(proxyReq: any, req: any) {
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
} as any);

export const simpleProxy = createProxyMiddleware({
  target: authServer,
  changeOrigin: true,
  headers: {
    Connection: "keep-alive",
  },
  onProxyReq(proxyReq: any) {
    proxyReq.setHeader("X-Forwarded-For", "127.0.0.1");
    proxyReq.setHeader("X-Forwarded-Proto", "http");
    proxyReq.setHeader("Host", "localhost");
  },
  proxyTimeout: 5000,
  onError(err: any) {
    console.log(err);
  },
} as any);
