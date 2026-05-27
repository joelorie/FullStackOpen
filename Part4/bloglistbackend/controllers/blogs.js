const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const config = require('../utils/config')
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    return response.status(200).json(blogs)
  } catch (error) {
    return response.status(500).json({ error: 'Internal Server Error' })
  }
})

blogRouter.post('/', async (request, response) => {
  const { title, url, author, likes } = request.body
  if (!title || !url)
    return response.status(400).json({ message: 'Missing title or url' })
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = request.user
  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id,
  })
  const result = await blog.save()
  user.blogs = user.blogs.concat(blog._id)
  await user.save()
  response.status(201).json(result)
})

blogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  const user = request.user
  if (!user) return response.status(401).json({ message: 'Unauthorized' })
  if (!id) return response.status(400).json({ message: 'Missing blog id' })
  const blog = await Blog.findOne({ _id: id })
  if (!blog) return response.status(404).json({ message: 'Blog not found!' })
  if (blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndDelete({ _id: id })
    user.blogs = user.blogs.filter((blog) => blog.toString() !== id)
    await user.save()
    response.status(200).json({ message: 'Blog deleted successfully!' })
  } else {
    return response.status(401).json({ error: 'Unauthorized' })
  }
})

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const { title, author, url, likes } = request.body
  const updatedObject = {}
  if (title) updatedObject.title = title
  if (author) updatedObject.author = author
  if (url) updatedObject.url = url
  if (likes) updatedObject.likes = likes
  if (!id) return response.status(400).json({ message: 'Missing blog id' })
  const blog = await Blog.findOne({ _id: id })
  if (!blog) return response.status(404).json({ message: 'Blog not found!' })
  const updatedBlog = await Blog.findByIdAndUpdate(id, updatedObject, {
    new: true,
    runValidators: true,
  })
  if (!updatedBlog)
    return response.status(500).json({ message: 'Failed to update blog' })
  response.status(200).json(updatedBlog)
})

module.exports = blogRouter
