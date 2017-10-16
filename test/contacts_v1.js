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

import chai from "chai";
import chaiHttp from "chai-http";
import server from "../server";
import mongoose from "mongoose";

const Account = mongoose.model("Account");
const should = chai.should();
chai.use(chaiHttp);

function dropCollections() {
  Account.collection.drop((err, affect) => {
   console.log("[MongoDB] Accounts don't exist.");
  });
}

describe("Contacts", () => {
  let accountId = null;
  let apiToken = null;

  let errorMessageEmailTakenField = "Is already taken.";
  let errorMessageBlankField = "Can't be blank.";

  let accountParams = { account: { fullname: "Demo Demo",
    email: "demo@demo.com", password: "demodemo" } };
  let contactParams = { contact: { fullname: "First Demo",
    email: "first@demo.com", phone: "+1325657932" } };

  before(done => {
    dropCollections();

    chai.request(server)
      .post("/api/v1/accounts")
      .send(accountParams)
      .end((err, res) => {
        res.should.have.status(201);
        accountId = res.body["account"]["id"];
        apiToken = res.body["account"]["token"];
        done();
    });
  });

  after(done => {
    dropCollections();
    done();
  });

  //
  // Test - POST /api/v1/contacts (Create)
  //
  describe("POST /api/v1/contacts", () => {
    it("it should receive an error - empty data", done => {
      chai.request(server)
        .post("/api/v1/contacts")
        .set("authorization", "Token " + apiToken)
        .send({})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property("status");
          res.body.status.should.be.equal("error");
          res.body.should.have.property("errors");
          res.body.errors.should.have.property("fullname");
          res.body.errors.fullname.should.equal(errorMessageBlankField);
          done();
      });
    });

    it("it should receive an error - empty contact", done => {
      chai.request(server)
        .post("/api/v1/contacts")
        .set("authorization", "Token " + apiToken)
        .send({ contact: {} })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property("status");
          res.body.status.should.be.equal("error");
          res.body.should.have.property("errors");
          res.body.errors.should.have.property("fullname");
          res.body.errors.fullname.should.equal(errorMessageBlankField);
          done();
      });
    });

    it("it should receive an error - empty fullname", done => {
      chai.request(server)
        .post("/api/v1/contacts")
        .set("authorization", "Token " + apiToken)
        .send({ contact: { fullname: "" } })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property("status");
          res.body.status.should.be.equal("error");
          res.body.should.have.property("errors");
          res.body.errors.should.have.property("fullname");
          res.body.errors.fullname.should.equal(errorMessageBlankField);
          done();
      });
    });

    it("it should receive a new contact #1", done => {
      chai.request(server)
        .post("/api/v1/contacts")
        .set("authorization", "Token " + apiToken)
        .send(contactParams)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property("contact");
          res.body.contact.should.not.be.null;
          res.body.contact.should.have.property("fullname");
          res.body.contact.fullname.should.not.be.null;
          res.body.contact.fullname.should.equal(contactParams["contact"]["fullname"]);
          res.body.contact.should.have.property("email");
          res.body.contact.email.should.not.be.null;
          res.body.contact.email.should.equal(contactParams["contact"]["email"]);
          res.body.contact.should.have.property("phone");
          res.body.contact.phone.should.not.be.null;
          res.body.contact.phone.should.equal(contactParams["contact"]["phone"]);
          done();
      });
    });

    it("it should receive a new contact #2", done => {
      chai.request(server)
        .post("/api/v1/contacts")
        .set("authorization", "Token " + apiToken)
        .send({ contact: { fullname: contactParams["contact"]["fullname"] } })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property("contact");
          res.body.contact.should.not.be.null;
          res.body.contact.should.have.property("fullname");
          res.body.contact.fullname.should.not.be.null;
          res.body.contact.fullname.should.equal(contactParams["contact"]["fullname"]);
          res.body.contact.should.have.property("email");
          res.body.contact.email.should.not.be.null;
          res.body.contact.email.should.equal("");
          res.body.contact.should.have.property("phone");
          res.body.contact.phone.should.not.be.null;
          res.body.contact.phone.should.equal("");
          done();
      });
    });

    it("it should receive a new contact #3", done => {
      chai.request(server)
        .post("/api/v1/contacts")
        .set("authorization", "Token " + apiToken)
        .send({ contact: { fullname: contactParams["contact"]["fullname"],
            email: contactParams["contact"]["email"] } })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property("contact");
          res.body.contact.should.not.be.null;
          res.body.contact.should.have.property("fullname");
          res.body.contact.fullname.should.not.be.null;
          res.body.contact.fullname.should.equal(contactParams["contact"]["fullname"]);
          res.body.contact.should.have.property("email");
          res.body.contact.email.should.not.be.null;
          res.body.contact.email.should.equal(contactParams["contact"]["email"]);
          res.body.contact.should.have.property("phone");
          res.body.contact.phone.should.not.be.null;
          res.body.contact.phone.should.equal("");
          done();
      });
    });

    it("it should receive a new contact #4", done => {
      chai.request(server)
        .post("/api/v1/contacts")
        .set("authorization", "Token " + apiToken)
        .send({ contact: { fullname: contactParams["contact"]["fullname"],
            phone: contactParams["contact"]["phone"] } })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property("contact");
          res.body.contact.should.not.be.null;
          res.body.contact.should.have.property("fullname");
          res.body.contact.fullname.should.not.be.null;
          res.body.contact.fullname.should.equal(contactParams["contact"]["fullname"]);
          res.body.contact.should.have.property("email");
          res.body.contact.email.should.not.be.null;
          res.body.contact.email.should.equal("");
          res.body.contact.should.have.property("phone");
          res.body.contact.phone.should.not.be.null;
          res.body.contact.phone.should.equal(contactParams["contact"]["phone"]);
          done();
      });
    });
  });
});
