const db = require("../db");
const Comment = db.comments;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  try {
    const comment = {
      ...req.body,
    };
    comment.productId = req.params.id;
    comment.userId = req.user.id;

    Comment.create(comment)
      .then((data) => {
        res.status(200).send({ message: "OK", data: data });
      })
      .catch((err) => {
        res.status(500).send({
          message: err || "Some error occurred while creating the Comment.",
        });
      });
  } catch (err) {
    res.status(500).send({
      message: err || "Some error occurred while creating the Comment.",
    });
  }
};

exports.getByProductId = (req, res) => {
  Comment.findAll({
    where: {
      productId: req.params.id,
    },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: db.users,
        as: "user",
        attributes: ["name", "id"],
      },
    ],
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while retrieving comments.",
      });
    });
};

exports.delete = (req, res) => {
  Comment.destroy({
    where: {
      id: req.params.commentId,
      productId: req.params.id,
    },
  })
    .then((data) => {
      res.status(200).send({ message: "OK", data: data });
    })
    .catch((err) => {
      res.status(500).send({
        message: err || "Some error occurred while deleting the Comment.",
      });
    });
};
