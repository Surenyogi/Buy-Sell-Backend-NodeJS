"use strict";

var jwt = require("jsonwebtoken");

var _require = require("../config.json"),
    secret = _require.secret;

var db = require("../db");

var User = db.users;

exports.authorized = function (req, res, next) {
  var token = req.headers.authorization || " ";
  token = token.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      message: "No token provided."
    });
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      return res.status(401).send({
        message: "Invalid token."
      });
    }

    User.findOne({
      where: {
        id: decoded.sub
      }
    }).then(function (user) {
      req.user = user;
      next();
    })["catch"](function (err) {
      res.status(500).send({
        message: err || "Some error occurred while retrieving user."
      });
    });
  });
};

exports.authorizedAdmin = function (req, res, next) {
  var token = req.headers.authorization || " ";
  token = token.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      message: "No token provided."
    });
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      return res.status(401).send({
        message: "Invalid token."
      });
    }

    User.findOne({
      where: {
        id: decoded.sub
      }
    }).then(function (user) {
      if (user.role !== "admin") {
        return res.status(401).send({
          message: "Unauthorized"
        });
      }

      req.user = user;
      next();
    })["catch"](function (err) {
      res.status(500).send({
        message: err || "Some error occurred while retrieving user."
      });
    });
  });
};