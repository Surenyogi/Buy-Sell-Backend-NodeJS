"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var db = require("../db");

var User = db.users;

var jwt = require("jsonwebtoken");

var bcrypt = require("bcrypt");

var config = require("../config.json");

var Sequelize = require("sequelize");

exports.create = function (req, res) {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    if (err) {
      return res.status(500).send("PASSWORD ERROR");
    } else {
      var role = "user";
      User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash,
        phone: req.body.phone,
        role: role
      }).then(function (data) {
        var token = jwt.sign({
          sub: data.id
        }, config.secret, {
          expiresIn: "7d"
        });
        res.status(200).header("x-auth-token", token).send({
          message: "OK",
          data: data
        });
      })["catch"](function (err) {
        res.status(500).send({
          message: "ERROR",
          error: err.errors[0].message || "Error creating user"
        });
      });
    }
  });
};

exports.login = function (req, res) {
  User.scope("withHash").findOne({
    where: {
      email: req.body.email.trim()
    }
  }).then(function (data) {
    if (data) {
      bcrypt.compare(req.body.password, data.password, function (err, result) {
        if (err) {
          return res.status(401).send({
            message: "Incorrect password"
          });
        }

        if (result) {
          var token = jwt.sign({
            sub: data.id
          }, config.secret, {
            expiresIn: "120d"
          });
          var response = res.status(200).header("x-auth-token", token);

          if (data.role === "admin") {
            response.header("admin", "true");
          }

          return response.send({
            message: "OK",
            data: data
          });
        }

        return res.status(401).send({
          message: "Incorrect password"
        });
      });
    } else {
      return res.status(401).send({
        message: "Invalid email"
      });
    }
  })["catch"](function (err) {
    res.status(500).send({
      message: "ERROR",
      error: err.errors[0].message || "Erorr logging in."
    });
  });
};

exports.register = function (req, res) {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    if (err) {
      return res.status(500).send("PASSWORD ERROR");
    } else {
      var role = "user";
      User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash,
        dob: req.body.dob,
        address: req.body.address,
        state: req.body.state,
        city: req.body.city,
        phone: req.body.phone,
        role: role
      }).then(function (data) {
        var token = jwt.sign({
          sub: data.id
        }, config.secret, {
          expiresIn: "7d"
        });
        res.status(200).header("x-auth-token", token).send({
          message: "OK",
          data: data
        });
      })["catch"](function (err) {
        res.status(500).send({
          message: "ERROR",
          error: err.errors[0].message || "Error creating user"
        });
      });
    }
  });
};

exports.changePassword = function (req, res) {
  var userId = req.user.id;
  var oldPassword = req.body.oldPassword;
  var newPassword = req.body.newPassword;
  console.log(req.body);
  User.scope("withHash").findOne({
    where: {
      id: userId
    }
  }).then(function (data) {
    if (data) {
      bcrypt.compare(oldPassword, data.password, function (err, result) {
        console.log(err, result);

        if (err) {
          return res.status(401).send({
            message: "Incorrect password"
          });
        }

        if (result) {
          bcrypt.hash(newPassword, 10, function (err, hash) {
            if (err) {
              return res.status(500).send("PASSWORD ERROR");
            } else {
              data.update({
                password: hash
              }).then(function (data) {
                res.status(200).send({
                  message: "OK",
                  data: data
                });
              })["catch"](function (err) {
                res.status(500).send({
                  message: err || "Some error occurred while updating the User."
                });
              });
            }
          });
        } else {
          return res.status(401).send({
            message: "Incorrect password"
          });
        }
      });
    } else {
      return res.status(401).send({
        message: "Invalid email"
      });
    }
  })["catch"](function (err) {
    res.status(500).send({
      message: "ERROR",
      error: err.errors[0].message || "Erorr logging in."
    });
  });
};

exports.updateProfile = function (req, res) {
  var userId = req.user.id;
  if (req.body.password) delete req.body.password;

  var user = _objectSpread({}, req.body);

  User.findOne({
    where: {
      id: userId
    }
  }).then(function (data) {
    if (data) {
      data.update(user).then(function (data) {
        res.status(200).send({
          message: "OK",
          data: data
        });
      })["catch"](function (err) {
        res.status(500).send({
          message: err || "Some error occurred while updating the User."
        });
      });
    } else {
      res.status(401).send({
        message: "Unauthorized"
      });
    }
  })["catch"](function (err) {
    res.status(500).send({
      message: "ERROR",
      error: err.errors[0].message || "Erorr logging in."
    });
  });
};

exports.getAll = function (req, res) {
  User.findAll({
    attributes: {
      exclude: ["password"],
      include: [[Sequelize.fn("COUNT", Sequelize.col("products.id")), "productsCount"]]
    },
    include: [{
      model: db.products,
      as: "products",
      attributes: []
    }],
    where: {
      role: "user"
    },
    group: ["User.id", "products.id"]
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: "ERROR",
      error: err || "Erorr getting results in."
    });
  });
};

exports["delete"] = function (req, res) {
  var userId = req.params.id;
  User.findOne({
    where: {
      id: userId
    }
  }).then(function (data) {
    if (data) {
      data.destroy({
        include: [{
          model: db.products
        }, {
          model: db.comments
        }, {
          model: db.reports
        }]
      }).then(function (data) {
        res.status(200).send({
          message: "OK",
          data: data
        });
      })["catch"](function (err) {
        res.status(500).send({
          message: err || "Some error occurred while deleting the User."
        });
      });
    } else {
      res.status(401).send({
        message: "Unauthorized"
      });
    }
  })["catch"](function (err) {
    res.status(500).send({
      message: "ERROR",
      error: err.errors[0].message || "Erorr logging in."
    });
  });
};

exports.resetPassword = function (req, res) {
  var email = req.body.email;
  var dob = req.body.dob;
  var newPassword = req.body.password;
  User.findOne({
    where: {
      email: email,
      dob: dob
    }
  }).then(function (data) {
    if (data) {
      bcrypt.hash(newPassword, 10, function (err, hash) {
        if (err) {
          return res.status(500).send("PASSWORD ERROR");
        } else {
          data.update({
            password: hash
          }).then(function (data) {
            res.status(200).send({
              message: "OK",
              data: data
            });
          })["catch"](function (err) {
            res.status(500).send({
              message: err || "Some error occurred while updating the User."
            });
          });
        }
      });
    } else {
      res.status(401).send({
        message: "Invalid user information"
      });
    }
  })["catch"](function (err) {
    res.status(500).send({
      message: "ERROR",
      error: err.errors[0].message || "Error resetting password."
    });
  });
};