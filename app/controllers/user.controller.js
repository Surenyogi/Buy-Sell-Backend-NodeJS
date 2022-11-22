const db = require("../db");
const User = db.users;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config.json");
const Sequelize = require("sequelize");

exports.create = (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).send("PASSWORD ERROR");
    } else {
      const role = "user";
      User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash,
        phone: req.body.phone,
        role: role,
      })
        .then((data) => {
          const token = jwt.sign({ sub: data.id }, config.secret, {
            expiresIn: "7d",
          });
          res
            .status(200)
            .header("x-auth-token", token)
            .send({ message: "OK", data: data });
        })
        .catch((err) => {
          res.status(500).send({
            message: "ERROR",
            error: err.errors[0].message || "Error creating user",
          });
        });
    }
  });
};

exports.login = (req, res) => {
  User.scope("withHash")
    .findOne({
      where: {
        email: req.body.email.trim(),
      },
    })
    .then((data) => {
      if (data) {
        bcrypt.compare(req.body.password, data.password, (err, result) => {
          if (err) {
            return res.status(401).send({
              message: "Incorrect password",
            });
          }
          if (result) {
            const token = jwt.sign({ sub: data.id }, config.secret, {
              expiresIn: "120d",
            });
            const response = res.status(200).header("x-auth-token", token);
            if (data.role === "admin") {
              response.header("admin", "true");
            }
            return response.send({
              message: "OK",
              data: data,
            });
          }
          return res.status(401).send({
            message: "Incorrect password",
          });
        });
      } else {
        return res.status(401).send({
          message: "Invalid email",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "ERROR",
        error: err.errors[0].message || "Erorr logging in.",
      });
    });
};

exports.register = (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).send("PASSWORD ERROR");
    } else {
      const role = "user";
      User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash,
        dob: req.body.dob,
        address: req.body.address,
        state: req.body.state,
        city: req.body.city,
        phone: req.body.phone,
        role: role,
      })
        .then((data) => {
          const token = jwt.sign({ sub: data.id }, config.secret, {
            expiresIn: "7d",
          });
          res

            .status(200)
            .header("x-auth-token", token)
            .send({ message: "OK", data: data });
        })
        .catch((err) => {
          res.status(500).send({
            message: "ERROR",
            error: err.errors[0].message || "Error creating user",
          });
        });
    }
  });
};

exports.changePassword = (req, res) => {
  const userId = req.user.id;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  console.log(req.body);
  User.scope("withHash")
    .findOne({
      where: {
        id: userId,
      },
    })
    .then((data) => {
      if (data) {
        bcrypt.compare(oldPassword, data.password, (err, result) => {
          console.log(err, result);
          if (err) {
            return res.status(401).send({
              message: "Incorrect password",
            });
          }
          if (result) {
            bcrypt.hash(newPassword, 10, (err, hash) => {
              if (err) {
                return res.status(500).send("PASSWORD ERROR");
              } else {
                data
                  .update({
                    password: hash,
                  })
                  .then((data) => {
                    res.status(200).send({ message: "OK", data: data });
                  })
                  .catch((err) => {
                    res.status(500).send({
                      message:
                        err || "Some error occurred while updating the User.",
                    });
                  });
              }
            });
          } else {
            return res.status(401).send({
              message: "Incorrect password",
            });
          }
        });
      } else {
        return res.status(401).send({
          message: "Invalid email",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "ERROR",
        error: err.errors[0].message || "Erorr logging in.",
      });
    });
};

exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  if (req.body.password) delete req.body.password;
  const user = {
    ...req.body,
  };
  User.findOne({
    where: {
      id: userId,
    },
  })
    .then((data) => {
      if (data) {
        data
          .update(user)
          .then((data) => {
            res.status(200).send({ message: "OK", data: data });
          })
          .catch((err) => {
            res.status(500).send({
              message: err || "Some error occurred while updating the User.",
            });
          });
      } else {
        res.status(401).send({
          message: "Unauthorized",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "ERROR",
        error: err.errors[0].message || "Erorr logging in.",
      });
    });
};

exports.getAll = (req, res) => {
  User.findAll({
    attributes: {
      exclude: ["password"],
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("products.id")), "productsCount"],
      ],
    },
    include: [
      {
        model: db.products,
        as: "products",
        attributes: [],
      },
    ],
    where: {
      role: "user",
    },
    group: ["User.id", "products.id"],
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: "ERROR",
        error: err || "Erorr getting results in.",
      });
    });
};

exports.delete = (req, res) => {
  const userId = req.params.id;
  User.findOne({
    where: {
      id: userId,
    },
  })
    .then((data) => {
      if (data) {
        data
          .destroy({
            include: [
              {
                model: db.products,
              },
              {
                model: db.comments,
              },
              {
                model: db.reports,
              },
            ],
          })
          .then((data) => {
            res.status(200).send({ message: "OK", data: data });
          })
          .catch((err) => {
            res.status(500).send({
              message: err || "Some error occurred while deleting the User.",
            });
          });
      } else {
        res.status(401).send({
          message: "Unauthorized",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "ERROR",
        error: err.errors[0].message || "Erorr logging in.",
      });
    });
};

exports.resetPassword = (req, res) => {
  const email = req.body.email;
  const dob = req.body.dob;
  const newPassword = req.body.password;

  User.findOne({
    where: {
      email: email,
      dob: dob,
    },
  })
    .then((data) => {
      if (data) {
        bcrypt.hash(newPassword, 10, (err, hash) => {
          if (err) {
            return res.status(500).send("PASSWORD ERROR");
          } else {
            data
              .update({
                password: hash,
              })
              .then((data) => {
                res.status(200).send({ message: "OK", data: data });
              })
              .catch((err) => {
                res.status(500).send({
                  message:
                    err || "Some error occurred while updating the User.",
                });
              });
          }
        });
      } else {
        res.status(401).send({
          message: "Invalid user information",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "ERROR",
        error: err.errors[0].message || "Error resetting password.",
      });
    });
};
