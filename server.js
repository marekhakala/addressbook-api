/*
  Copyright 2017 <hakala.marek@gmail.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import fs from "fs";
import http from "http";
import path from "path";
import cors from "cors";
import methods from "methods";
import express from "express";
import passport from "passport";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
import errorhandler from "errorhandler";
import firebaseAdmin from "firebase-admin";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const isDevelopment = nodeEnv === "development";
const appConfig = require("./config/env.json")[nodeEnv];
const serviceAccount = require("./config/serviceAccountKey.json");
const mongooseHandler = require("./app/config/mongoose");

app.use(cors());
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if(isDevelopment) { mongoose.set("debug", true); }
mongoose.Promise = global.Promise;
mongoose.connect(appConfig["MONGO_URI"],
  appConfig["MONGO_OPTIONS"], mongooseHandler);

firebaseAdmin.initializeApp({ credential:
  firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: appConfig["FIREBASE_URL"] });

app.use(require("method-override")());
app.use(session({ secret: "addressbookapi", cookie: { maxAge: 60000 },
  resave: false, saveUninitialized: false }));
if(!isProduction) { app.use(errorhandler()); }

require("./app/models/account");
require("./app/config/passport");
app.use(require("./app/routes"));

const docsPath = "/api-docs";
const docsJsonPath = docsPath + ".json";
const swaggerOptions = require("./app/config/swagger");
const swaggerSpec = swaggerJSDoc(swaggerOptions);
const swaggerUiHandler = swaggerUi.setup(swaggerSpec);

app.get(docsJsonPath, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use(docsPath, swaggerUi.serve, (req, res, next) => {
  if (!req.query.url) {
    let protocol = (req.protocol === "https") ? "https" : "http";
    res.redirect(`${docsPath}?url=${protocol}://${req.headers.host}${docsJsonPath}`);
  } else {
    swaggerUiHandler(req, res, next);
  }
});

/// Error 404 handler
app.use((req, res, next) => {
  res.status(404).json({ status: "error", "errors": { error: "Not Found" } });
  next();
});

// Development Error Handler
if (!isProduction) {
  app.use((err, req, res, next) => {
    console.log(err.stack);

    res.status(err.status || 500);
    res.json({ status: "error", "errors": { error: err, message: err.message }});
  });
}

// Production Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ status: "error", "errors": { error: err } })
});

// Start server
const server = app.listen(process.env.PORT || appConfig["PORT"], () => {
  console.log("Starting server ... ;)");
  console.log("NODE_ENV=" + nodeEnv);
  console.log("Listening on port " + server.address().port);
});

module.exports = server;
