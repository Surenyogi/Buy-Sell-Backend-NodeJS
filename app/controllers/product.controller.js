const db = require("../db");
const Product = db.products;
const Image = db.images;
const { uploader } = require("../helpers/image-helper");

exports.create = async (req, res) => {
  try {
    const product = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      categoryId: req.body.categoryId,
      userId: req.user.id,
      type: req.body.type,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };

    const prod = await Product.create(product);

    if (req.files && req.files.length > 0) {
      const images = await uploader(req.files);

      for (let i = 0; i < images.length; i++) {
        const image = {
          url: images[i],
          productId: prod.id,
        };
        await Image.create(image);
      }

      const product = Product.findOne({
        where: {
          id: prod.id,
        },
        include: [
          {
            model: db.images,
            as: "images",
            attributes: ["url"],
          },
        ],
      });

      product
        .then((data) => {
          res.status(200).send({ message: "OK", data: data });
        })
        .catch((err) => {
          res.status(500).send({
            message: err || "Some error occurred while retrieving products.",
          });
        });
    } else {
      res.status(200).send({ message: "OK", data: prod });
    }
  } catch (err) {
    res.status(500).send({
      message: err || "Some error occurred while creating the Product.",
    });
  }
};

exports.getById = (req, res) => {
  Product.findOne({
    where: {
      id: req.params.id,
    },
  })

    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while retrieving the Product.",
      });
    });
};

exports.getFeatured = (req, res) => {
  Product.findAll({
    where: {
      featured: true,
    },
    include: [
      {
        model: db.images,
        as: "images",
        attributes: ["url"],
      },
      {
        model: db.users,
        as: "user",
        attributes: [
          "name",
          "email",
          "address",
          "city",
          "phone",
          "state",
          "id",
        ],
      },
    ],
    limit: 5,
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while retrieving products.",
      });
    });
};

exports.markAsSold = (req, res) => {
  Product.update(
    {
      status: "sold",
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )

    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while retrieving products.",
      });
    });
};

exports.markAsFeatured = (req, res) => {
  Product.update(
    {
      featured: req.query.featured ?? false,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )

    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while retrieving products.",
      });
    });
};

exports.getRecent = (req, res) => {
  Product.findAll({
    where: {
      featured: false,
    },
    include: [
      {
        model: db.images,
        as: "images",
        attributes: ["url"],
      },
      {
        model: db.users,
        as: "user",
        attributes: [
          "name",
          "email",
          "address",
          "city",
          "phone",
          "state",
          "id",
        ],
      },
    ],
    order: [[db.Sequelize.col("createdAt"), "DESC"]],
    limit: 5,
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while retrieving products.",
      });
    });
};

exports.getAll = (req, res) => {
  const name = req.query.name;
  const categoryId = req.query.categoryId;
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

  const _where = {};
  if (name) {
    _where.name = {
      [db.Sequelize.Op.like]: `%${name}%`,
    };
  }

  if (categoryId && categoryId > 0) {
    _where.categoryId = categoryId;
  }

  if (req.query.minPrice != "null" && req.query.maxPrice != "null") {
    _where.price = {
      [db.Sequelize.Op.between]: [req.query.minPrice, req.query.maxPrice],
    };
  }

  if (req.query.featured == "true") {
    _where.featured = true;
  }

  console.log("QUERY: ", _where);

  Product.findAll({
    where: {
      ..._where,
    },
    include: [
      {
        model: db.images,
        as: "images",
        attributes: ["url"],
      },
      {
        model: db.users,
        as: "user",
        attributes: [
          "name",
          "email",
          "address",
          "city",
          "phone",
          "state",
          "id",
        ],
      },
    ],
    order: [
      [sort, dir],
      [db.Sequelize.col("createdAt"), "DESC"],
    ],
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: err || "Some error occurred while retrieving products.",
      });
    });
};

exports.update = (req, res) => {
  const product = {
    ...req.body,
  };

  const productDb = Product.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  productDb.then((data) => {
    if (data) {
      data
        .update(product)

        .then((data) => {
          res.status(200).send({ message: "OK", data: data });
        })

        .catch((err) => {
          res.status(500).send({
            message: err || "Some error occurred while updating the Product.",
          });
        });
    } else {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
  });
};

exports.delete = (req, res) => {
  const productDb = Product.findOne({
    where: {
      id: req.params.id,
    },
  });

  productDb.then((data) => {
    if (data) {
      data
        .destroy()
        .then((data) => {
          res.status(200).send({ message: "OK", data: data });
        })

        .catch((err) => {
          res.status(500).send({
            message: err || "Some error occurred while deleting the Product.",
          });
        });
    } else {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
  });
};

exports.getByUserId = (req, res) => {
  Product.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      {
        model: db.images,
        as: "images",
        attributes: ["url"],
      },
      {
        model: db.users,
        as: "user",
        attributes: [
          "name",
          "email",
          "address",
          "city",
          "phone",
          "state",
          "id",
        ],
      },
    ],
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while retrieving products.",
      });
    });
};
