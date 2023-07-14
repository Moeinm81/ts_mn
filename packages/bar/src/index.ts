/* eslint-disable import/no-extraneous-dependencies */
// https://developer.okta.com/blog/2018/11/15/node-express-typescript
import dotenv from "dotenv";
import path from "path";
// import { devtools } from "./dev/dev";

import express from "express";
import fs from "fs";
import https from "https";
// import { createProxyMiddleware } from "http-proxy-middleware";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // Inject additional properties on express.Request
    interface User {
      username: string;
      accessToken: string;
      refreshToken: string;
    }

    interface Request {
      /**
       * This request's secret.
       * Optionally set by cookie-parser if secret(s) are provided.  Can be used by other middleware.
       * [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) can be used to add your own properties.
       */
      user?: User | undefined;
      cookies?: any;
      headers?: any;
    }
  }
}
// initialize configuration
const resolve = path.resolve(__dirname, "../data/.env");
console.log(resolve);
dotenv.config({ path: resolve });

// eslint-disable-next-line camelcase
const enale_https = false;
let httpsOptions: https.ServerOptions;

// eslint-disable-next-line camelcase
if (enale_https) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  httpsOptions = {
    key: fs.readFileSync("./data/security/cert.key"),
    cert: fs.readFileSync("./data/security/cert.pem"),
  };
}
// port is now available to the Node.js runtime
// as if it were an environment variable
// const port = process.env.SERVER_PORT;
// const isDevelopment = process.env.NODE_ENV === "development";
import * as core from "express-serve-static-core";
// import bodyParser from "body-parser";
// import http from "http";
// import url from "url";

const app: core.Express = express();

// app.use(express.json());

import passport from "passport";

import OAuth2Strategy, { VerifyCallback } from "passport-oauth2";
// import BearerStrategy from "passport-http-bear";
import cookieSession from "cookie-session";
import jwtDecode, { JwtPayload } from "jwt-decode";
import refresh from "passport-oauth2-refresh";
import cookieParser from "cookie-parser";

app.use(cookieParser() as any);

// import FormData from "form-data";
import {
  api_server,
  getNormalProxyforUrl,
  grafanaProxy,
  pardazaServer,
  prestoProxy,
  projectProxy,
  simpleProxy,
} from "./proxy";

class User {
  username: string;

  accessToken: string;

  refreshToken: string;

  constructor(username: string, accessToken: string, refreshToken: string) {
    this.username = username;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

// cookieSession config
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["secret-personalize"],
  }) as any
);
app.use(passport.initialize());
app.use(passport.session());
const OAUTH_ISSUER_URI = "https://app.pardaza.ir/auth/realms/pardaza/";
const oauthOptions = {
  authorizationURL:
    "https://app.pardaza.ir/auth/realms/pardaza/protocol/openid-connect/auth",
  tokenURL:
    "https://app.pardaza.ir/auth/realms/pardaza/protocol/openid-connect/token",
  clientID: "pardaza-ui",
  clientSecret: "TemylTJwFhf4b7FtpMY6mWVjWuiq2I6S",
  callbackURL: "http://localhost:8080/login/oauth2/keycloak/callback",
};

function getUserFtomToken(accessToken: string, refreshToken: string) {
  const jwt: any = jwtDecode<JwtPayload>(accessToken); // Returns with the JwtPayload type

  return new User(jwt.preferred_username, accessToken, refreshToken);
}

const oAuth2Strategy = new OAuth2Strategy(oauthOptions, function (
  accessToken: string,
  refreshToken: string,
  profile: any,
  cb: VerifyCallback
) {
  const user = getUserFtomToken(accessToken, refreshToken);

  return cb(null, user);
});
passport.use(oAuth2Strategy);
refresh.use(oAuth2Strategy);

// passport.use(new BearerStrategy(
//     function(accessToken, done) {
//         let user = getUserFtomToken(accessToken,null);
//         return done(null, user);
//
//     }
// ));

async function getNewToken(
  req: Express.Request,
  res: Express.Response,
  // eslint-disable-next-line @typescript-eslint/ban-types
  next: () => {}
) {
  if (req.user) {
    const token = req.user.refreshToken;

    refresh.requestNewAccessToken(
      "oauth2",
      token,
      function (err: any, accessToken: string, refreshToken: string) {
        if (req.user) {
          req.user.accessToken = accessToken;
          req.user.refreshToken = refreshToken;
        }
        next();
        // You have a new access token, store it in the user object,
        // or use it to make a new request.
        // `refreshToken` may or may not exist, depending on the strategy you are using.
        // You probably don't need it anyway, as according to the OAuth 2.0 spec,
        // it should be the same as the initial refresh token.
      }
    );
  }
  // const form = new FormData();
  // form.append("client_id", oauthOptions.clientID);
  // form.append("client_secret", oauthOptions.clientSecret);
  // form.append("username", "admin");
  // form.append("password", "123");
  // form.append("grant_type", "password");
  // // const data = await got.post(oauthOptions.tokenURL, {
  // //     body: form
  // // }).json();
  // // return data;
  // let tokenURL: string = oauthOptions.tokenURL;
  // var url = new URL(tokenURL)
  // var client: any = http; /* default  client */
  // client = (url.protocol == "https:") ? https : client;
  //
  //
  // var request = client.request(tokenURL, {
  //     method: 'post',
  //     headers: form.getHeaders()
  // });
  //
  // form.pipe(request);
  //
  // request.on('response', function (res: any) {
  //     console.log(res.statusCode);
  // });
}

// Used to decode the received cookie and persist session

passport.deserializeUser((json: string, done) => {
  // const jwt:any = jwtDecode<JwtPayload>(accessToken); // Returns with the JwtPayload type
  try {
    const user = JSON.parse(json);
    done(null, user);
  } catch (e) {
    // done("cant parse user", null);
  }
});
passport.serializeUser(function (user: User, done) {
  done(null, JSON.stringify(user));
});
app.get("/oauth2/authorization/keycloak", passport.authenticate("oauth2"));

app.get(
  "/login/oauth2/keycloak/callback",
  passport.authenticate("oauth2", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    if (req.user) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.cookie("auth", req.user.accessToken, {
        httpOnly: true,
        sameSite: "strict",
      } as any);

      req.login(req.user, function (err) {
        if (err) {
          return error401(req, res);
        }

        return res.redirect("/");
      });
    }
    // return res.status(401).send('string').end();
  }
);

// let timeout=2000;

// const clients: Map<string, SocketIO.Socket> = new Map<string, SocketIO.Socket>();
// const tokens: Map<SocketIO.Socket, string> = new Map<SocketIO.Socket, string>();
//
// if (isDevelopment) {
//   devtools(app);
// }
// app.use( bodyParser.json() );
// app.use( bodyParser.urlencoded( {
//     extended: true
// } ) );

// app.use(express.static('jsapp'))

// Configure Express to use EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// define a route handler for the default home page
let numberOfLoad = 0;

function log(msg: any) {
  // tslint:disable-next-line:no-console
  console.log(msg);
}

// if (enale_https) {

//     https.createServer(httpsOptions, app)
//         .listen(port, () => {
//             log('server running at ' + port)
//         })
// } else {
//     app.listen(port, () => {
//         log(`server started at http://localhost:${port}`);
//     });
// }

const oauth = passport.authenticate("session", { failWithError: true });

function error401(req: Express.Request, res: Express.Response) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  res.status(401);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return res.json({ loginUrl: OAUTH_ISSUER_URI });
}

const getToken: core.RequestHandler = function (
  req: Express.Request,
  res: Express.Response,
  next: core.NextFunction | undefined
) {
  if (req.cookies && req.headers) {
    const token = req.cookies.auth;

    if (token) {
      if (!req.headers) {
        req.headers = {};
      }
      req.headers.authorization = `bearer ${token}`;
    }
  }
  next!();
};

const authfilter: core.RequestHandler = function (
  req: Express.Request,
  res: Express.Response,
  next: core.NextFunction | undefined
) {
  if (req.headers && req.headers.authorization) {
    const a = req.headers.authorization;

    if (a) {
      const b = a.split(" ");

      // eslint-disable-next-line eqeqeq
      if (b.length == 2 && b[0] == "bearer") {
        const user = getUserFtomToken(b[1], b[0]); //reveiw

        if (user) {
          req.user = user;
          next!();

          return;
        }
      }
    }
  }

  // eslint-disable-next-line consistent-return
  return error401(req, res);
};

app.use(
  "/me",
  getToken,
  authfilter,
  // eslint-disable-next-line func-names, consistent-return
  function (req: Express.Request, res: Express.Response) {
    if (req.user) {
      const user = req.user as User;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.json({
        username: user.username,
        name: user.username,
      });
    } else {
      return error401(req, res);
    }
  }
);

app.get("/auth/realms/pardaza/account/", (req, res) => {
  // render the index template

  res.render("index2", {
    nol: numberOfLoad++,
    user: encodeURI(JSON.stringify({ username: "mohammad" })),
  });
});

const pardazaProxy = getNormalProxyforUrl(pardazaServer);
const localProxy = getNormalProxyforUrl("http://localhost:8020/");
const localProjectProxy = getNormalProxyforUrl("http://localhost:8000/");
const localDashboardProxy = getNormalProxyforUrl("http://localhost:8000/");


app.use("/auth/", pardazaProxy as any);
app.use("/api/", getToken, authfilter, pardazaProxy as any);
app.use("/swagger-ui/", getToken, authfilter, pardazaProxy as any);
app.use("/v3/", getToken, authfilter, pardazaProxy as any);
app.use("/webjars/", getToken, authfilter, pardazaProxy as any);
app.use("/swagger-ui.html", getToken, authfilter, pardazaProxy as any);
app.use("/projects/**", getToken, authfilter, pardazaProxy as any);
app.use("/abc/**", getToken, authfilter, localProjectProxy as any);
// app.use('/projects/abc/**', getToken, authfilter, pardazaProxy);
app.use("/grafana/", getToken, authfilter, pardazaProxy as any);

app.use("/ui", getToken, authfilter, pardazaProxy as any);
app.use("/presto", getToken, authfilter, pardazaProxy as any);
app.use("/app/dashboard", getToken, authfilter, pardazaProxy as any);

app.get("/*", (req, res) => {
  // render the index template

  res.render("index", {
    nol: numberOfLoad++,
    user: encodeURI(JSON.stringify({ username: "mohammad" })),
  });
});

console.log("run is fo/src/index");
