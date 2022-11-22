"use strict";

module.exports = function (sequelize, DataTypes) {
  var Comment = sequelize.define("Comment", {
    comment: {
      type: DataTypes.STRING,
      allowNull: false
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
    timestamp: true
  });
  return Comment;
};