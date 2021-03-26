const router = require("express").Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

// TO DO: PUT MIDDLEWARES FOR JWT AND BCRYPT PW

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/profile").get((req, res) => {
  const { authorization } = req.headers;
  const incomingToken = authorization && authorization.split("Bearer ")[1];

  jwt.verify(incomingToken, process.env.SECRET, async (err, decoded) => {
    const id = decoded.id;

    try {
      const user = await User.findOne({ id });
      res.status(200).json({ user });
    } catch (error) {
      res.status(400).json({ error });
    }
  });
});

router.route("/login").post(async (req, res) => {
  const { authorization } = req.headers;
  const { username, password } = req.body;
  const incomingToken = authorization && authorization.split("Bearer ")[1];

  const user = await User.findOne({ username });
  if (incomingToken) {
    jwt.verify(incomingToken, process.env.SECRET, (err, decoded) => {
      if (user.id === decoded.id) {
        console.log("is correct next>");
        bcrypt.compare(password, user.password).then(async (correct) => {
          if (correct) {
            res.status(200).json({
              username: user.username,
              token: incomingToken,
            });
          } else {
            res.status(400).json({ Error: "Incorrect Password" });
          }
        });
      }
    });
  } else {
    console.log("no token go!");
    const { id } = user;

    bcrypt.compare(password, user.password).then(async (correct) => {
      if (correct) {
        const token = jwt.sign({ id }, process.env.SECRET, {
          expiresIn: 100000,
        });
        res.status(200).json({
          username: user.username,
          token,
        });
      } else {
        res.status(400).json({ Error: "Incorrect Password" });
      }
    });
  }
});

router.route("/register").post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const id = nanoid();

  const newUser = new User({ username, password, id });

  newUser
    .save()
    .then(() => {
      const token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: 100000,
      });
      console.log(token);
      res.status(200).json({ success: true, token });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

module.exports = router;
