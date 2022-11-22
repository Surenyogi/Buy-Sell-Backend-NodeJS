"use strict";

var _require = require("../middleware/authorize"),
    authorized = _require.authorized,
    authorizedAdmin = _require.authorizedAdmin;

var multer = require("multer");

var _require2 = require("../helpers/image-helper"),
    uploader = _require2.uploader;

var storage = multer.diskStorage({
  filename: function filename(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});
var upload = multer({
  storage: storage
});

module.exports = function (app) {
  var userController = require("../controllers/user.controller");

  var categoryController = require("../controllers/category.controller");

  var productController = require("../controllers/product.controller");

  var reportController = require("../controllers/report.controller");

  var commentController = require("../controllers/comment.controller");

  app.post("/users", userController.create);
  app.post("/login", userController.login);
  app.post("/register", userController.register);
  app.post("/reset-password", userController.resetPassword);
  app.get("/users", authorized, userController.getAll);
  app["delete"]("/users/:id", authorized, userController["delete"]);
  app.get("/categories", categoryController.getAll);
  app.post("/categories", authorized, categoryController.create);
  app.put("/categories/:id", authorized, categoryController.update);
  app.get("/categories/with-products", categoryController.getAllWithProducts);
  app.post("/change-password", authorized, userController.changePassword);
  app.put("/update-profile", authorized, userController.updateProfile);
  app.post("/products", upload.array("img", 3), authorized, productController.create);
  app.get("/products", productController.getAll);
  app.get("/products/featured", productController.getFeatured);
  app.get("/products/recent", productController.getRecent);
  app.get("/products/:id", productController.getById);
  app["delete"]("/products/:id", authorized, productController["delete"]);
  app.post("/products/:id/sell", productController.markAsSold);
  app.post("/products/:id/featured", productController.markAsFeatured);
  app.get("/products/:id/comments", commentController.getByProductId);
  app.post("/products/:id/comments", authorized, commentController.create);
  app["delete"]("/products/:id/comments/:commentId", authorized, commentController["delete"]);
  app.put("/products/:id", productController.update); // app.delete("/products/:id", authorized, productController.delete);

  app.post("/products/:id/reports", authorized, reportController.create);
  app.get("/products/:id/reports", authorized, reportController.getByProductId);
  app.get("/my-ads", authorized, productController.getByUserId);
  app.post("/upload", upload.array("img", 3), function _callee(req, res) {
    var urls, images;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(req.files && req.files.length > 0)) {
              _context.next = 7;
              break;
            }

            urls = [];
            _context.next = 4;
            return regeneratorRuntime.awrap(uploader(req.files));

          case 4:
            images = _context.sent;
            console.log(images);
            res.status(200).send({
              message: "OK",
              data: images
            });

          case 7:
          case "end":
            return _context.stop();
        }
      }
    });
  });
};