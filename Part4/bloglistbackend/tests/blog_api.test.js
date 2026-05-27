const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test') // Added describe here
const User = require('../models/user')
const bcrypt = require('bcryptjs')

const helper = require('../utils/test_helper')
const Blog = require('../models/blog')

const getToken = async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('supersecretpassword', 10)
  const user = new User({
    username: 'jones',
    passwordHash,
    name: 'John Jones',
  })

  await user.save()

  const loginResponse = await api.post('/api/login').send({
    username: 'jones',
    password: 'supersecretpassword',
  })
  return loginResponse.body.token
}

const api = supertest(app)

describe('blog api tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  describe('GET /api/blogs', () => {
    test('correct number of blogs returned', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('blog identifier is named id', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      assert(Object.keys(response.body[0]).includes('id'))
    })
  })

  describe('POST /api/blogs', () => {
    test('adding a new blog post works correctly', async () => {
      const token = await getToken()

      const newBlogPost = {
        title: 'New Post',
        author: 'Jill Doe',
        url: 'yetanotherrandomwebsite.com',
        likes: 3,
      }
      const response = await api
        .post('/api/blogs')
        .send(newBlogPost)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogCount = await helper.blogsInDb()

      assert.strictEqual(response.body.title, newBlogPost.title)
      assert.strictEqual(blogCount.length, helper.initialBlogs.length + 1)
    })

    test('adding a blog post without likes defaults to 0', async () => {
      const token = await getToken()
      const newBlogPost = {
        title: 'Newer Post',
        author: 'Joseph Doe',
        url: 'example.com',
      }
      const response = await api
        .post('/api/blogs')
        .send(newBlogPost)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)
    })

    test('adding a blog post without title fails', async () => {
      const token = await getToken()
      const newBlogPost = {
        author: 'Joseph Doe',
        url: 'example.com',
      }
      await api
        .post('/api/blogs')
        .send(newBlogPost)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })

    test('adding a blog post without url fails', async () => {
      const newBlogPost = {
        title: 'Introduction to C',
        author: 'Joseph Doe',
      }
      await api.post('/api/blogs').send(newBlogPost).expect(400)
    })
  })

  describe('DELETE /api/blogs/:id', () => {
    test('deleting a blog post works', async () => {
      const token = await getToken()
      const newBlogPost = {
        title: 'Newer Post',
        author: 'Joseph Doe',
        url: 'example.com',
      }
      const response = await api
        .post('/api/blogs')
        .send(newBlogPost)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const initialBlogsInDb = await helper.blogsInDb()
      const blogId = initialBlogsInDb[initialBlogsInDb.length - 1].id
      await api
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      const finalBlogsInDb = await helper.blogsInDb()
      assert.strictEqual(initialBlogsInDb.length, finalBlogsInDb.length + 1)
    })
  })

  describe('PUT /api/blogs/:id', () => {
    test('updating a single field works', async () => {
      const blogs = await helper.blogsInDb()
      const updatedBlog = {
        likes: 12,
      }
      const blogId = blogs[0].id
      await api.put(`/api/blogs/${blogId}`).send(updatedBlog).expect(200)

      const updatedBlogs = await helper.blogsInDb()
      const targetBlog = updatedBlogs.find((blog) => blog.id === blogId)
      assert.strictEqual(targetBlog.likes, 12)
    })

    test('updating all fields works', async () => {
      const blogs = await helper.blogsInDb()
      const updatedBlog = {
        author: 'John Johnson',
        title: 'Kevin Johnson',
        url: 'www.johnson.com',
        likes: 12,
      }
      const blogId = blogs[0].id
      await api.put(`/api/blogs/${blogId}`).send(updatedBlog).expect(200)

      const updatedBlogs = await helper.blogsInDb()
      const targetBlog = updatedBlogs.find((blog) => blog.id === blogId)
      assert.strictEqual(targetBlog.likes, 12)
      assert.strictEqual(targetBlog.author, 'John Johnson')
      assert.strictEqual(targetBlog.url, 'www.johnson.com')
      assert.strictEqual(targetBlog.title, 'Kevin Johnson')
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
