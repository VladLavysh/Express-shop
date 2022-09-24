const { Router } = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const { validationResult } = require('express-validator')
const { courseValidators } = require('../utils/validators')
const router = Router()

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Add course',
    isAdd: true
  })
})

router.post('/', auth, courseValidators, async (req, res) => {
  const result = validationResult(req)
  const { title, price, image } = req.body

  if (!result.isEmpty()) {
    return res.status(422).render('add', {
      title: 'Add course',
      isAdd: true,
      error: result.errors[0].msg,
      data: { title, price, image }
    })
  }

  const course = new Course({ title, price, image, userId: req.user })

  try {
    await course.save()
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
