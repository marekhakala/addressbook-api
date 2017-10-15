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
import passport from "passport";
const router = require("express").Router();
const Account = mongoose.model("Account");
import auth from "../../auth";

router.get("/account", auth.required, (req, res, next) => {
  Account.findById(req.payload.id).then(account => {
    if(account == null) {
      return res.sendStatus(401);
    }

    return res.status(200).json({ account: account.toAuthJSON() });
  }).catch(next);
});

router.put("/account", auth.required, (req, res, next) => {
  Account.findById(req.payload.id).then((account) => {
    if(account == null) {
      return res.sendStatus(401);
    }

    if(req.body.account
      && req.body.account.currentPassword) {
      var errorsCount = 0;
      var errorsHash = {};

      if(!account.validPassword(req.body.account.currentPassword)) {
        return res.status(422)
        .json({ status: "error",
          errors: { currentPassword: "Current password isn't correct." }});
      }

      if(req.body.account.fullname != null) {
        if(req.body.account.fullname.length > 0) {
          account.fullname = req.body.account.fullname;
        } else {
          errorsHash.fullname = "Can't be blank.";
          errorsCount++;
        }
      }

      if(req.body.account.password != null) {
        if(req.body.account.password.length > 0) {
          account.setPassword(req.body.account.password);
        } else {
          errorsHash.password = "Can't be blank.";
          errorsCount++;
        }
      }

      if(errorsCount > 0) {
        return res.status(422).json({ status: "error", errors: errorsHash });
      }

      return account.save().then(() => {
        return res.status(200).json({ status: "updated",
         account: account.toAuthJSON() });
      });
    } else {
      return res.status(422)
      .json({ status: "error",
        errors: { currentPassword: "Can't be blank." }});
    }
  }).catch(next);
});

router.post("/accounts/signin", (req, res, next) => {
  var errorsCount = 0;
  var errorsHash = {};
  var errorMessage = "Can't be blank.";

  if(!req.body.account) {
    errorsHash.email = errorMessage;
    errorsHash.password = errorMessage;
    errorsCount = 2;
  } else {
    if(!req.body.account.email) {
      errorsHash.email = errorMessage;
      errorsCount++;
    }

    if(!req.body.account.password) {
      errorsHash.password = errorMessage;
      errorsCount++;
    }
  }

  if(errorsCount > 0) {
    return res.status(422).json({ status: "error", errors: errorsHash });
  }

  passport.authenticate("local", { session: false },
    (err, account, info) => {
    if(err) {
      return next(err);
    }

    if(account) {
      account.token = account.generateJWT();
      return res.status(200).json({ status: "ok", account: account.toAuthJSON() });
    } else {
      return res.status(422).json(info);
    }

  })(req, res, next);
});

router.post("/accounts", (req, res, next) => {
  let errorsCount = 0;
  let errorsHash = {};
  let errorMessage = "Can't be blank.";

  if(!req.body.account) {
    errorsHash.fullname = errorMessage;
    errorsHash.email = errorMessage;
    errorsHash.password = errorMessage;
    errorsCount = 3;
  } else {
    if(!req.body.account.fullname) {
      errorsHash.fullname = errorMessage;
      errorsCount++;
    }

    if(!req.body.account.email) {
      errorsHash.email = errorMessage;
      errorsCount++;
    }

    if(!req.body.account.password) {
      errorsHash.password = errorMessage;
      errorsCount++;
    }
  }

  if(errorsCount > 0) {
    return res.status(422).json({ status: "error", errors: errorsHash });
  }

  const account = new Account();
  account.fullname = req.body.account.fullname;
  account.email = req.body.account.email;
  account.setPassword(req.body.account.password);

  account.save().then(() => {
    return res.status(201).json({ status: "created",
     account: account.toAuthJSON() });
  }).catch(next);
});

module.exports = router;
