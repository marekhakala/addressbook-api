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

// Swagger options
module.exports = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "Address Book API",
      description: "The address book is an address book web API application for SPA and mobile applications.",
      contact: {
        name: "Marek Hakala",
        email: "hakala.marek@gmail.com"
      },
      license: {
        name: "Apache License, Version 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0"
      }
    },
    basePath: "/api",
  },
  produces: ["application/json"],
  consumes: ["application/json"],
  securityDefinitions: {
    Jwt: {
      description: "Bla bla bla",
      type: "apiKey",
      name: "Authorization",
      in: "header"
    }
  },
  "security": [
    {
        "jwt": []
    }
  ],
  apis: [
    "./app/routes/api/v1/accounts.js",
    "./app/routes/api/v1/contacts.js"
  ]
};
