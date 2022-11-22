const db = require("../db");
const Report = db.reports;

exports.create = (req, res) => {
  try {
    const report = {
      ...req.body,
    };

    report.userId = req.user.id;
    report.productId = req.params.id;

    Report.create(report)
      .then((data) => {
        res.status(200).send({ message: "OK", data: data });
      })
      .catch((err) => {
        res.status(500).send({
          message: err || "Some error occurred while creating the Report.",
        });
      });
  } catch (err) {
    res.status(500).send({
      message: err || "Some error occurred while creating the Report.",
    });
  }
};

exports.getByProductId = (req, res) => {
  Report.findAll({
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
        message: err || "Some error occurred while retrieving reports.",
      });
    });
};
