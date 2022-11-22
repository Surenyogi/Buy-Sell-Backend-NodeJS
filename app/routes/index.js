const { authorized, authorizedAdmin } = require("../middleware/authorize");
const multer = require("multer");
const { uploader } = require("../helpers/image-helper");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({
  storage,
});

module.exports = (app) => {
  const userController = require("../controllers/user.controller");
  const categoryController = require("../controllers/category.controller");
  const productController = require("../controllers/product.controller");
  const reportController = require("../controllers/report.controller");
  const commentController = require("../controllers/comment.controller");

  app.post("/users", userController.create);
  app.post("/login", userController.login);
  app.post("/register", userController.register);
  app.post("/reset-password", userController.resetPassword);

  app.get("/users", authorized, userController.getAll);
  app.delete("/users/:id", authorized, userController.delete);

  app.get("/categories", categoryController.getAll);
  app.post("/categories", authorized, categoryController.create);
  app.put("/categories/:id", authorized, categoryController.update);
  app.get("/categories/with-products", categoryController.getAllWithProducts);

  app.post("/change-password", authorized, userController.changePassword);
  app.put("/update-profile", authorized, userController.updateProfile);

  app.post(
    "/products",
    upload.array("img"),
    authorized,
    productController.create
  );
  app.get("/products", productController.getAll);
  app.get("/products/featured", productController.getFeatured);
  app.get("/products/recent", productController.getRecent);

  app.get("/products/:id", productController.getById);
  app.delete("/products/:id", authorized, productController.delete);
  app.post("/products/:id/sell", productController.markAsSold);
  app.post("/products/:id/featured", productController.markAsFeatured);

  app.get("/products/:id/comments", commentController.getByProductId);
  app.post("/products/:id/comments", authorized, commentController.create);
  app.delete(
    "/products/:id/comments/:commentId",
    authorized,
    commentController.delete
  );

  app.put("/products/:id", productController.update);
  // app.delete("/products/:id", authorized, productController.delete);

  app.post("/products/:id/reports", authorized, reportController.create);
  app.get("/products/:id/reports", authorized, reportController.getByProductId);

  app.get("/my-ads", authorized, productController.getByUserId);

  app.post("/upload", upload.array("img", 3), async (req, res) => {
    if (req.files && req.files.length > 0) {
      const urls = [];
      const images = await uploader(req.files);
      console.log(images);
      res.status(200).send({ message: "OK", data: images });
    }
  });
};
