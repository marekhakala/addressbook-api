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

import express from "express";
const router = express.Router();

import mongoose from "mongoose";
import Account from "./app/models/Account";

const nodeEnv = process.env.NODE_ENV || "development";
const isDevelopment = nodeEnv === "development";
const appConfig = require("./config/env.json")[nodeEnv];

function dropCollections() {
  Account.collection.drop((err, affect) => {
   console.log("[MongoDB] Accounts don't exist.");
  });
}

mongoose.Promise = global.Promise;
mongoose.connect(appConfig["MONGO_URI"], appConfig["MONGO_OPTIONS"]);
if(isDevelopment) { mongoose.set("debug", true); }
dropCollections();

// Accounts
let accountFirstObject = new Account({ fullname: "Demo Demo", email: "demo@demo.com" });
accountFirstObject.setPassword("demodemo");
let accountSecondObject = new Account({ fullname: "SecondDemo Demo", email: "second@demo.com" });
accountSecondObject.setPassword("demodemo");
let accountThirdObject = new Account({ fullname: "ThirdDemo Demo", email: "third@demo.com" });
accountThirdObject.setPassword("demodemo");

Promise.all([ accountFirstObject.save(), accountSecondObject.save(), accountThirdObject.save() ])
.then(userResults => {
  console.log("DONE ;)");
  mongoose.disconnect();
});
