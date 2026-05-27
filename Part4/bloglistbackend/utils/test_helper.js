const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'First Blog Post',
    author: 'John Doe',
    url: 'randomwebsite.com',
    likes: 1,
  },
  {
    title: 'Second Blog Post',
    author: 'Jane Doe',
    url: 'anotherrandomwebsite.com',
    likes: 2,
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = { initialBlogs, blogsInDb, usersInDb }
