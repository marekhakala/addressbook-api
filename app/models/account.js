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

import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { secret as secret } from "../config";

class AccountSchema extends mongoose.Schema {
  constructor() {
    const account = super({ fullname: { type: String, required: [ true, "Can't be blank." ], index: true },
        email: { type: String, lowercase: true, unique: true,
           required: [ true, "Can't be blank." ], match: [ /\S+@\S+\.\S+/, "is invalid" ], index: true },
        hash: String, salt: String
    }, { timestamps: true })

    account.methods.validPassword = this.validPassword
    account.methods.setPassword = this.setPassword
    account.methods.generateJWT = this.generateJWT

    account.methods.toAuthJSON = this.toAuthJSON
    account.methods.toJSON = this.toJSON

    account.static("findByEmail", this.findByEmail)
    account.plugin(uniqueValidator, { message: "Is already taken." })

    return account
  }

  validPassword(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
    return this.hash === hash;
  }

  setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
  }

  generateJWT() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({ id: this._id, fullname: this.fullname, exp: parseInt(exp.getTime() / 1000) }, secret);
  }

  findByEmail(email, callback) {
    return this.find({ email: email }, callback);
  }

  toAuthJSON() {
    return { id: this._id, fullname: this.fullname, email: this.email, token: this.generateJWT() };
  }

  toJSON() {
    return { id: this._id, fullname: this.fullname, email: this.email };
  }
}

module.exports = mongoose.model("Account", new AccountSchema);
