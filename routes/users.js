const router = require("express").Router();
let User = require("../models/user.model");

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add").post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const newUser = new User({ username, password });

  newUser
    .save()
    .then(() => res.status(200).json({ success: true }))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
