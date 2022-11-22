"use strict";

module.exports = function (sequelize, DataTypes) {
  var Image = sequelize.define("Image", {
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  });
  return Image;
};