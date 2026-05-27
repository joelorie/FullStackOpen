const bcrypt = require('bcryptjs')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username | !password)
    return response
      .status(400)
      .json({ message: 'Username and password are required.' })

  if ((username.length < 3) | (password.length < 3))
    return response.status(400).json({
      message: 'Username and password must be at least 3 characters long.',
    })

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  try {
    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()
    return response.status(201).json(savedUser)
  } catch (error) {
    if (error.code === 11000) {
      return response
        .status(400)
        .json({ message: 'Wrong username or password.' })
    }
    console.log(error)
    return response.status(500).json({ message: 'Internal server error.' })
  }
})

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  })
  response.status(200).json(users)
})

module.exports = userRouter
