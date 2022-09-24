const path = require('path')
const multer = require('multer')
const crypto = require('crypto')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'images')
  },
  filename(req, file, cb) {
    const fileName = crypto.randomBytes(20).toString('hex') + path.extname(file.originalname)
    cb(null, fileName)
  }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const fileFilter = (req, file, cb) => {
  const allowedType = allowedTypes.includes(file.mimetype)

  cb(null, allowedType)
}

module.exports = multer({
  storage, fileFilter
})

