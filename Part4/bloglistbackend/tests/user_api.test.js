const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')

const bcrypt = require('bcryptjs')
const helper = require('../utils/test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('supersecretpassword', 10)
    const user = new User({
      username: 'jones',
      passwordHash,
      name: 'John Jones',
    })

    await user.save()
  })
  describe('User creation and fetching tests', () => {
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'davis',
        name: 'David Davis',
        password: 'verystrongpassword',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map((u) => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creating a user without a username fails', async () => {
      const newUser = {
        name: 'David Davis',
        password: 'averystrongpassword',
      }
      await api.post('/api/users').send(newUser).expect(400)
    })

    test('creating a user without a password fails', async () => {
      const newUser = {
        name: 'David Davis',
        username: 'davedavis',
      }
      await api.post('/api/users').send(newUser).expect(400)
    })

    test('creating a user with a short username fails', async () => {
      const newUser = {
        username: 'Fi',
        name: 'David Davis',
        password: 'averystrongpassword',
      }
      await api.post('/api/users').send(newUser).expect(400)
    })

    test('creating a user with a short password fails', async () => {
      const newUser = {
        username: 'Davido',
        name: 'David Davis',
        password: 'hi',
      }
      await api.post('/api/users').send(newUser).expect(400)
    })

    test('creating a user with an existing username fails', async () => {
      const newUser = {
        username: 'jones',
        name: 'David Davis',
        password: 'verystrongpassword',
      }
      await api.post('/api/users').send(newUser).expect(400)
    })

    test('fetching users from db works', async () => {
      await api.get('/api/users').expect(200)
    })
  })
})

after(async () => {
  await User.deleteMany({}) // Optional: Clean up after yourself
  await mongoose.connection.close()
})
