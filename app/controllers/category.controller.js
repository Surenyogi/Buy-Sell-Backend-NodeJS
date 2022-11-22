const db = require("../db");
const Category = db.categories;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  
  const category = {
    name: req.body.name,
    description: req.body.description,
    icon: req.body.icon,
  };

  Category.create(category)
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.errors[0].message ||
          "Some error occurred while creating the Category.",
      });
    });
};

exports.getAll = (req, res) => {
  Category.findAll()
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.errors[0].message ||
          "Some error occurred while retrieving categories.",
      });
    });
};

exports.getAllWithProducts = (req, res) => {
  Category.findAll({
    include: [
      {
        model: db.products,
        as: "products",
      },
    ],
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while retrieving categories.",
      });
    });
};

exports.delete = (req, res) => {
  Category.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.errors[0].message ||
          "Some error occurred while deleting the Category.",
      });
    });
};

exports.update = (req, res) => {
  const category = {
    ...req.body,
  };

  Category.update(category, {
    where: {
      id: req.params.id,
    },
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.errors[0].message ||
          "Some error occurred while updating the Category.",
      });
    });
};
