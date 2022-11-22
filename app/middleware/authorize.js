const jwt = require("jsonwebtoken");
const { secret } = require("../config.json");
const db = require("../db");
const User = db.users;

exports.authorized = (req, res, next) => {
  let token = req.headers.authorization || " ";
  token = token.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      message: "No token provided.",
    });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Invalid token.",
      });
    }

    User.findOne({
      where: {
        id: decoded.sub,
      },
    })
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        res.status(500).send({
          message: err || "Some error occurred while retrieving user.",
        });
      });
  });
};

exports.authorizedAdmin = (req, res, next) => {
  let token = req.headers.authorization || " ";
  token = token.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      message: "No token provided.",
    });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Invalid token.",
      });
    }

    User.findOne({
      where: {
        id: decoded.sub,
      },
    })
      .then((user) => {
        if (user.role !== "admin") {
          return res.status(401).send({
            message: "Unauthorized",
          });
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        res.status(500).send({
          message: err || "Some error occurred while retrieving user.",
        });
      });
  });
};
