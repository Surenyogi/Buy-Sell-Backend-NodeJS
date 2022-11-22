"use strict";

module.exports = function (sequelize, DataTypes) {
  var Category = sequelize.define("Category", {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamp: true
  });
  return Category;
};