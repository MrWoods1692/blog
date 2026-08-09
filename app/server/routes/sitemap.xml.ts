import { defineEventHandler, setHeader } from 'h3'
import postsIndex from '../../../content/posts/index.json'

export default defineEventHandler((event) => {
  const baseUrl = 'https://woods.blog'
  const posts = postsIndex

  const urls = [
    `<url><loc>${baseUrl}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${baseUrl}/archive</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    `<url><loc>${baseUrl}/tags</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    `<url><loc>${baseUrl}/moments</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>0.6</priority></url>`,
    `<url><loc>${baseUrl}/search</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`
  ]

  posts.forEach(post => {
    urls.push(
      `<url><loc>${baseUrl}/posts/${post.id}</loc><lastmod>${post.date}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`
    )
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
