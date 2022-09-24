const { body } = require('express-validator');
const User = require('../models/user');

exports.registerValidators = [
  body('name', 'Name length must be min 3 chars')
    .isLength({ min: 3 })
    .trim(),
  body('email', 'Email is incorrect')
    .isEmail()
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value })
        if (user) {
          return Promise.reject('Email already exists')
        }
      } catch (e) {
        console.log(e);
      }
    })
    .normalizeEmail(),
  body('password', 'Password length must be min 6 chars')
    .isLength({ min: 6, max: 25 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match')
      }
      return true
    })
    .trim(),
]

// TODO
exports.loginValidators = [
  body('email', 'User does not exist')
    .isEmail()
    .normalizeEmail()
    .custom(async value => {
      try {
        const user = await User.findOne({ email: value })
        if (!user) {
          return Promise.reject('User does not exist')
        }
      } catch (e) {
        console.log(e);
      }
    }),
  body('password', 'Password is incorrect')
    .isLength({ min: 6, max: 25 })
    .isAlphanumeric()
    .trim()
    .custom(async (value, { req }) => {
      try {
        //const user = await User.findOne({ email: value })
        //console.log(user)
        //if (!user) {
        //  return Promise.reject('User does not exist')
        //}
      } catch (e) {
        console.log(e);
      }
    })
]

exports.courseValidators = [
  body('title', 'Min length is 3 chars')
    .isLength({ min: 3 })
    .trim(),
  body('price', 'Min price is 1')
    .isNumeric()
    .isLength({ min: 1 })
    .trim(),
  body('img', 'Enter correct image url')
    .isURL()
    .trim()
]