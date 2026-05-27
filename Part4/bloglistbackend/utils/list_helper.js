const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) return 0
  if (blogs.length === 1) return blogs[0].likes
  else {
    return blogs.reduce((sum, blogpost) => sum + blogpost.likes, 0)
  }
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 1) return blogs[0]
  else {
    const maxLikes = Math.max(...blogs.map((blog) => blog.likes))
    return blogs.find((blogPost) => blogPost.likes === maxLikes)
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 1)
    return { author: blogs[0].author, blogs: blogs.length }
  else {
    const blogTotals = Object.values(
      blogs.reduce((acc, blog) => {
        acc[blog.author] = acc[blog.author] || { author: blog.author, blogs: 0 }
        acc[blog.author].blogs += 1
        return acc
      }, {})
    )
    return blogTotals.find(
      (blogPost) =>
        blogPost.blogs === Math.max(...blogTotals.map((blog) => blog.blogs))
    )
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 1) {
    return { author: blogs[0].author, likes: blogs[0].likes }
  } else {
    const likeTotals = Object.values(
      blogs.reduce((acc, blogPost) => {
        acc[blogPost.author] = acc[blogPost.author] || {
          author: blogPost.author,
          likes: 0,
        }
        acc[blogPost.author].likes += blogPost.likes
        return acc
      }, {})
    )

    return likeTotals.find(
      (blogPost) =>
        blogPost.likes === Math.max(...likeTotals.map((b) => b.likes))
    )
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
