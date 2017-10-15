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
import firebaseAdmin from "firebase-admin";

const router = require("express").Router();
const Account = mongoose.model("Account");
import auth from "../../auth";

router.post("/", auth.required, (req, res, next) => {
  Account.findById(req.payload.id).then(user => {
    if (user == null) {
      return res.sendStatus(401);
    }

    let accountId = req.payload.id;
    let errorsCount = 0;
    let errorsHash = {};
    let errorMessage = "Can't be blank.";

    if(!req.body.contact
      || !req.body.contact.fullname
      || req.body.contact.fullname.trim().length < 1) {
      errorsHash.fullname = errorMessage;
      errorsCount++;
    }

    if(errorsCount > 0) {
      return res.status(422).json({ status: "error", errors: errorsHash });
    }

    try {
      const database = firebaseAdmin.database();
      const databaseReference = database.ref('/accounts' + '/' + accountId);

      let fullname = req.body.contact.fullname;
      let email = (req.body.contact.email) ? req.body.contact.email : "";
      let phone = (req.body.contact.phone) ? req.body.contact.phone : "";
      const contactObject = { fullname: fullname, email: email, phone: phone };

      databaseReference.child("contacts").push(contactObject);
      return res.status(201).json({ status: "created",
        contact: contactObject });
    } catch(errorMessage) {
      return res.status(503).json({ status: "errror",
        errors: { "Firebase": "Internal error" } });
    }
  });
});

module.exports = router;
