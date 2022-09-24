const { Router } = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')
const router = Router()

function mapOrderItems(orders) {
  return orders.map(el => ({
    ...el._doc,
    price: computePrice(el.courses)
  }))
}

function computePrice(courses) {
  return courses.reduce((total, el) => {
    return total += el.count * el.course.price
  }, 0)
}

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id })
      .populate('user.userId')

    res.render('orders', {
      title: 'Orders',
      isOrder: true,
      orders: mapOrderItems(orders)
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate(['cart.items.courseId'])

    const courses = user.cart.items.map(el => ({
      count: el.count,
      course: { ...el.courseId._doc }
    }))

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses
    })

    await order.save()
    await req.user.clearCart()

    res.redirect('/orders')
  } catch (e) {
    console.log(e)
  }

})

module.exports = router
