"use strict";

module.exports = function (sequelize, DataTypes) {
  var Review = sequelize.define("Review", {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    byUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
  return Review;
};