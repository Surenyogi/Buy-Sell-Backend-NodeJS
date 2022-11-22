"use strict";

var dbConfig = require("../config/db.config");

var Sequelize = require("sequelize");

var sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});
var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = require("../models/user.model")(sequelize, Sequelize.DataTypes);
db.categories = require("../models/category.model")(sequelize, Sequelize.DataTypes);
db.products = require("../models/product.model")(sequelize, Sequelize.DataTypes);
db.images = require("../models/image.model")(sequelize, Sequelize.DataTypes);
db.reports = require("../models/report.model")(sequelize, Sequelize.DataTypes);
db.comments = require("../models/comment.model")(sequelize, Sequelize.DataTypes);
db.users.hasMany(db.products, {
  foreignKey: "userId",
  as: "products",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.products.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.products.hasMany(db.images, {
  foreignKey: "productId",
  as: "images",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.products.belongsTo(db.categories, {
  foreignKey: "categoryId",
  as: "category",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.categories.hasMany(db.products, {
  foreignKey: "categoryId",
  as: "products",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.users.hasMany(db.reports, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.reports.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.reports.belongsTo(db.products, {
  foreignKey: "productId",
  as: "product",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.images.belongsTo(db.products, {
  foreignKey: "productId",
  as: "product",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.products.hasMany(db.comments, {
  foreignKey: "productId",
  as: "comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.comments.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.comments.belongsTo(db.products, {
  foreignKey: "productId",
  as: "product",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
db.products.hasMany(db.reports, {
  foreignKey: "productId",
  as: "reports",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
module.exports = db;