const User = require('../models/user')
const jwt = require('jsonwebtoken')

const userExtractor = async (req, res, next) => {
  try {
    const auth = req.get('authorization')

    if (!auth || !auth.startsWith('Bearer ')) {
      req.user = null
      return next()
    }

    const token = auth.replace('Bearer ', '')
    req.token = token

    const decoded = jwt.verify(token, process.env.SECRET)
    req.user = await User.findById(decoded.id)

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = userExtractor
