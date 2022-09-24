const { Router } = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const User = require('../models/user')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const { registerValidators, loginValidators } = require('../utils/validators')
const resetEmail = require('../emails/reset')
const router = Router()

const transporter = nodemailer.createTransport(sendgrid({
  auth: { api_key: keys.SENDGRID_API_KEY }
}))

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Authorisation',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/login', loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body
    const candidate = await User.findOne({ email })
    const areSame = candidate
      ? await bcrypt.compare(password, candidate.password)
      : null

    if (!candidate || !areSame) {
      req.flash('loginError', 'The user with this password does not exist')
      return res.redirect('/auth/login#login')
    }

    req.session.user = candidate
    req.session.isAuthenticated = true
    req.session.save(err => {
      if (err) throw err
      res.redirect('/')
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body

    const result = validationResult(req)
    if (!result.isEmpty()) {
      req.flash('registerError', result.errors[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email, name,
      password: hashPassword,
      cart: { items: [] }
    })
    await user.save()
    await transporter.sendMail(regEmail(email))
    res.redirect('/auth/login#login')
  } catch (e) {
    console.log(e)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Password recovery',
    error: req.flash('error')
  })
})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something\'s wrong. Try again later')
        return res.redirect('/auth/reset')
      }
      const candidate = await User.findOne({ email: req.body.email })

      if (!candidate) {
        req.flash('error', 'There is no user with this email')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')

      candidate.resetToken = token
      candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
      await candidate.save()
      await transporter.sendMail(resetEmail(candidate.email, token))
      res.redirect('/auth/login')
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login')
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() }
    })

    if (!user) {
      return res.redirect('/auth/login')
    }

    res.render('auth/password', {
      title: 'Recover access',
      error: req.flash('error'),
      userId: user._id.toString(),
      token: req.params.token
    })
  } catch (e) {
    console.log(e);
  }
})

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() }
    })

    if (!user) {
      req.flash('error', 'The token\'s lifetime has expired')
      return res.redirect('/auth/login')
    }

    user.password = await bcrypt.hash(req.body.password, 10)
    user.resetToken = user.resetTokenExp = undefined
    await user.save()

    res.redirect('/auth/login')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
