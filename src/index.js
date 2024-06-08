import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';

import errorToJson from "@stdlib/error-to-json";

import log, { logger, httpLogMiddleware } from "./logger.js";
import { contextProvider, proxyWithContext } from "./async-context.js";

// routes
import superheroRoutes from './superhero/index.js';
const app = express();

/** only for local-dev*/
if(process.env.NODE_ENV == 'local-dev') {
  app.use(cors());
}
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// logger
app.use(httpLogMiddleware);
// set the log, txnId for each request
app.use(function (req, _res, next) {
  const store = {
    log: req.log,
    txnId: req.txnId,
  };
  return contextProvider(store, next);
});

app.get("/version", function (req, res, next) {
  log.info("contextual log");
  //throw new Error("hi");
  return res.json({
    name: "sandeep",
  });
});

app.use('/superheroes', superheroRoutes);

/**
 * @type {import('express').ErrorRequestHandler}
 */
const errorHandler = function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  let log = req.log || console;
  // decorate error
  err.txnId = req.txnId;
  err.statusCode = err.statusCode || 500;
  log.error(err);
  res.status(err.statusCode).json({
    ...errorToJson(err),
  });
  return;
};
app.use(errorHandler);

export default app;
