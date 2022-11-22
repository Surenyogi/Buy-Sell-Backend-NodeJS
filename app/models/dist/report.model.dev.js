"use strict";

var db = require("../db");

module.exports = function (sequelize, DataTypes) {
  var Report = sequelize.define("Report", {
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    additionalInfo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  });
  return Report;
};