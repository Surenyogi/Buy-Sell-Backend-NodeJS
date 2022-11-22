"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var db = require("../db");

var Comment = db.comments;
var Op = db.Sequelize.Op;

exports.create = function (req, res) {
  try {
    var comment = _objectSpread({}, req.body);

    comment.productId = req.params.id;
    comment.userId = req.user.id;
    Comment.create(comment).then(function (data) {
      res.status(200).send({
        message: "OK",
        data: data
      });
    })["catch"](function (err) {
      res.status(500).send({
        message: err || "Some error occurred while creating the Comment."
      });
    });
  } catch (err) {
    res.status(500).send({
      message: err || "Some error occurred while creating the Comment."
    });
  }
};

exports.getByProductId = function (req, res) {
  Comment.findAll({
    where: {
      productId: req.params.id
    },
    order: [["createdAt", "DESC"]],
    include: [{
      model: db.users,
      as: "user",
      attributes: ["name", "id"]
    }]
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err || "Some error occurred while retrieving comments."
    });
  });
};

exports["delete"] = function (req, res) {
  Comment.destroy({
    where: {
      id: req.params.commentId,
      productId: req.params.id
    }
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err || "Some error occurred while deleting the Comment."
    });
  });
};