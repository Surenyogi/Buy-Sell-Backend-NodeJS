"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var db = require("../db");

var Product = db.products;
var Image = db.images;

var _require = require("../helpers/image-helper"),
    uploader = _require.uploader;

exports.create = function _callee(req, res) {
  var product, prod, images, i, image, _product;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          product = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            categoryId: req.body.categoryId,
            userId: req.user.id,
            type: req.body.type,
            expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
          };
          _context.next = 4;
          return regeneratorRuntime.awrap(Product.create(product));

        case 4:
          prod = _context.sent;

          if (!(req.files && req.files.length > 0)) {
            _context.next = 21;
            break;
          }

          _context.next = 8;
          return regeneratorRuntime.awrap(uploader(req.files));

        case 8:
          images = _context.sent;
          i = 0;

        case 10:
          if (!(i < images.length)) {
            _context.next = 17;
            break;
          }

          image = {
            url: images[i],
            productId: prod.id
          };
          _context.next = 14;
          return regeneratorRuntime.awrap(Image.create(image));

        case 14:
          i++;
          _context.next = 10;
          break;

        case 17:
          _product = Product.findOne({
            where: {
              id: prod.id
            },
            include: [{
              model: db.images,
              as: "images",
              attributes: ["url"]
            }]
          });

          _product.then(function (data) {
            res.status(200).send({
              message: "OK",
              data: data
            });
          })["catch"](function (err) {
            res.status(500).send({
              message: err || "Some error occurred while retrieving products."
            });
          });

          _context.next = 22;
          break;

        case 21:
          res.status(200).send({
            message: "OK",
            data: prod
          });

        case 22:
          _context.next = 27;
          break;

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](0);
          res.status(500).send({
            message: _context.t0 || "Some error occurred while creating the Product."
          });

        case 27:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 24]]);
};

exports.getById = function (req, res) {
  Product.findOne({
    where: {
      id: req.params.id
    }
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err || "Some error occurred while retrieving the Product."
    });
  });
};

exports.getFeatured = function (req, res) {
  Product.findAll({
    where: {
      featured: true
    },
    include: [{
      model: db.images,
      as: "images",
      attributes: ["url"]
    }, {
      model: db.users,
      as: "user",
      attributes: ["name", "email", "address", "city", "phone", "state", "id"]
    }],
    limit: 5
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err || "Some error occurred while retrieving products."
    });
  });
};

exports.markAsSold = function (req, res) {
  Product.update({
    status: "sold"
  }, {
    where: {
      id: req.params.id
    }
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err || "Some error occurred while retrieving products."
    });
  });
};

exports.markAsFeatured = function (req, res) {
  Product.update({
    featured: true
  }, {
    where: {
      id: req.params.id
    }
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err || "Some error occurred while retrieving products."
    });
  });
};

exports.getRecent = function (req, res) {
  Product.findAll({
    where: {
      featured: false
    },
    include: [{
      model: db.images,
      as: "images",
      attributes: ["url"]
    }, {
      model: db.users,
      as: "user",
      attributes: ["name", "email", "address", "city", "phone", "state", "id"]
    }],
    order: [[db.Sequelize.col("createdAt"), "DESC"]],
    limit: 5
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err || "Some error occurred while retrieving products."
    });
  });
};

exports.getAll = function (req, res) {
  var name = req.query.name;
  var categoryId = req.query.categoryId;
  console.log(categoryId);
  var sort = req.query.sort || "latest";
  var dir = "DESC";

  if (!sort || sort == "default" || sort == "latest") {
    sort = "createdAt";
    dir = "DESC";
  } else if (sort == "lowToHigh") {
    sort = "price";
    dir = "ASC";
  } else if (sort == "highToLow") {
    sort = "price";
    dir = "DESC";
  } else if (sort == "relevance") {
    sort = "name";
    dir = "ASC";
  } else if (sort == "a-z") {
    sort = "name";
    dir = "ASC";
  } else if (sort == "z-a") {
    sort = "name";
    dir = "DESC";
  }

  var _where = {};

  if (name) {
    _where.name = _defineProperty({}, db.Sequelize.Op.like, "%".concat(name, "%"));
  }

  if (categoryId && categoryId > 0) {
    _where.categoryId = categoryId;
  }

  if (req.query.minPrice != "null" && req.query.maxPrice != "null") {
    _where.price = _defineProperty({}, db.Sequelize.Op.between, [req.query.minPrice, req.query.maxPrice]);
  }

  if (req.query.featured == "true") {
    _where.featured = true;
  }

  console.log("QUERY: ", _where);
  Product.findAll({
    where: _objectSpread({}, _where),
    include: [{
      model: db.images,
      as: "images",
      attributes: ["url"]
    }, {
      model: db.users,
      as: "user",
      attributes: ["name", "email", "address", "city", "phone", "state", "id"]
    }],
    order: [[sort, dir], [db.Sequelize.col("createdAt"), "DESC"]]
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    console.log(err);
    res.status(500).send({
      message: err || "Some error occurred while retrieving products."
    });
  });
};

exports.update = function (req, res) {
  var product = _objectSpread({}, req.body);

  var productDb = Product.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });
  productDb.then(function (data) {
    if (data) {
      data.update(product).then(function (data) {
        res.status(200).send({
          message: "OK",
          data: data
        });
      })["catch"](function (err) {
        res.status(500).send({
          message: err || "Some error occurred while updating the Product."
        });
      });
    } else {
      res.status(401).send({
        message: "Unauthorized"
      });
    }
  });
};

exports["delete"] = function (req, res) {
  var productDb = Product.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });
  productDb.then(function (data) {
    if (data) {
      data.destroy().then(function (data) {
        res.status(200).send({
          message: "OK",
          data: data
        });
      })["catch"](function (err) {
        res.status(500).send({
          message: err || "Some error occurred while deleting the Product."
        });
      });
    } else {
      res.status(401).send({
        message: "Unauthorized"
      });
    }
  });
};

exports.getByUserId = function (req, res) {
  Product.findAll({
    where: {
      userId: req.user.id
    },
    include: [{
      model: db.images,
      as: "images",
      attributes: ["url"]
    }, {
      model: db.users,
      as: "user",
      attributes: ["name", "email", "address", "city", "phone", "state", "id"]
    }]
  }).then(function (data) {
    res.status(200).send({
      message: "OK",
      data: data
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err || "Some error occurred while retrieving products."
    });
  });
};