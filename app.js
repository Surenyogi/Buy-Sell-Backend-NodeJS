const express = require("express");
const cors = require("cors");
const dbConnection = require("./app/db");
const bc = require("bcrypt");

const bcrypt = require("bcrypt");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true,limit: "50mb" }));

dbConnection.sequelize.sync();

const User = dbConnection.users;
//default admin
//email: admin@od.com
//password: admin
bcrypt.hash("admin", 10, (err, hash) => {
  if (err) {
  } else {
    User.findOrCreate({
      where: { 
        email: "admin@od.com",
      },
      defaults: {
        name: "admin",
        email: "admin@od.com",
        password: hash,
        phone: "1234567890",
        role: "admin",
        address: "KTM",
        dob: "2020-01-01",
        city: "Kathmandu",
        state: "Bagmati",
      },
    });
  }
});

require("./app/routes")(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
