const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const user = require('../models/user');

const router = express.Router();

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user
      .save()
      .then((result) => {
        console.debug(`[${req.id}] User created successfully: ${user.email}`);
        res.status(201).json({
          message: 'User created successfully',
          result
        });
      })
      .catch((err) => {
        console.error(`[${req.id}] Error: ${err}`);
        res.status(500).json({
          error: err
        });
      });
  });
});

router.post('/login', (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        console.error(`[${req.id}] User email not found: ${user.email}`);
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        console.error(`[${req.id}] Password does not match for: ${fetchedUser.email}`);
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      const token = jwt.sign({ email: fetchedUser.email, userId: fetchedUser._id }, 'secret_this_should_be_longer', {
        expiresIn: '1h'
      });
      console.debug(`[${req.id}] User logged in successfully: ${fetchedUser.email}`);
      res.status(200).json({
        message: 'User logged in successfully',
        token
      });
    })
    .catch((err) => {
      console.error(`[${req.id}] Error: ${err}`);
      res.status(401).json({
        message: 'Auth failed'
      });
    });
});

module.exports = router;
