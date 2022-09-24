// Using file as DB
//const path = require('path')
//const fs = require('fs')
//const { v4: uuid } = require('uuid');

//class Course {
//  constructor(title, price, image) {
//    console.log(title, price, image)
//    this.price = price
//    this.title = title
//    this.image = image
//    this.id = uuid()
//  }

//  toJSON() {
//    return {
//      title: this.title,
//      price: this.price,
//      image: this.image,
//      id: this.id
//    }
//  }

//  async save() {
//    const courses = await Course.getAll()
//    courses.push(this.toJSON())

//    const filePath = path.join(__dirname, '..', 'data', 'courses.json')
//    return new Promise((resolve, reject) => {
//      fs.writeFile(filePath, JSON.stringify(courses), (err) => {
//        if (err) reject(err)
//        else resolve()
//      })
//    })
//  }

//  static async update(course) {
//    const courses = await Course.getAll()
//    const idx = courses.findIndex(el => el.id === course.id)

//    courses[idx] = course

//    const filePath = path.join(__dirname, '..', 'data', 'courses.json')
//    return new Promise((resolve, reject) => {
//      fs.writeFile(filePath, JSON.stringify(courses), (err) => {
//        if (err) reject(err)
//        else resolve()
//      })
//    })
//  }

//  static getAll() {
//    const dbPath = path.join(__dirname, '..', 'data', 'courses.json')

//    return new Promise((resolve, reject) => {
//      fs.readFile(dbPath, 'utf-8', (err, content) => {
//        if (err) reject(err)
//        else resolve(JSON.parse(content))
//      })
//    })
//  }

//  static async getById(id) {
//    const courses = await Course.getAll()
//    return courses.find(c => c.id === id)
//  }
//}

//module.exports = Course

// Using MongoDB
const { Schema, model } = require('mongoose')

const course = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

course.method('toClient', function () {
  const course = this.toObject()

  course.id = course._id
  delete course._id

  return course
})

module.exports = model('Course', course)
