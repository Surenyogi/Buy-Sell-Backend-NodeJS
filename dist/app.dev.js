"use strict";

var express = require("express");

var cors = require("cors");

var dbConnection = require("./app/db");

var bc = require("bcrypt");

var bcrypt = require("bcrypt");

var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
dbConnection.sequelize.sync();
var User = dbConnection.users;
bcrypt.hash("admin", 10, function (err, hash) {
  if (err) {} else {
    User.findOrCreate({
      where: {
        email: "admin@od.com"
      },
      defaults: {
        name: "admin",
        email: "admin@od.com",
        password: hash,
        phone: "1234567890",
        role: "admin",
        address: "KTM",
        dob: "2020-01-01",
        city: "Kathmandu",
        state: "Bagmati"
      }
    });
  }
});

require("./app/routes")(app);

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Server is running on port ".concat(PORT));
});