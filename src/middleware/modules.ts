// Express Server
import express from "express";
const app = express();

// Cookie parser
import cookieParser from "cookie-parser";
// Compress response
import compression from "compression";
// Set and secure HTTP/HTTPS request headers
import helmet from "helmet";
// Detail Console logging
import morgan from "morgan";
// Cross-origin resource sharing
import cors from "cors";

app.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(
  helmet({
    frameguard: {
      action: "deny",
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
    dnsPrefetchControl: false,
    referrerPolicy: {
      policy: "same-origin",
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    hidePoweredBy: true,
    noSniff: true,
    xssFilter: true,
    ieNoOpen: false,
    permittedCrossDomainPolicies: {},
  })
);

app.use(
  helmet(),
  cookieParser(process.env.COOKIE_SECRET),
  express.urlencoded({ extended: true }),
  express.json({
    limit: `${
      process.env.MAX_UPLOAD_SIZE ? +process.env.MAX_UPLOAD_SIZE + 5 : 20
    }mb`,
  }),
  compression(),
  morgan("combined")
);

export { app };
