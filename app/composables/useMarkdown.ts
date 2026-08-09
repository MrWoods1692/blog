import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'

export const useMarkdown = () => {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
  })

  md.use(MarkdownItAnchor, {
    level: [2, 3],
    permalink: false,
    slugify: (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '')
  })

  const render = (content: string) => {
    try {
      if (!content) return ''
      return md.render(content)
    } catch {
      return content || ''
    }
  }

  return { render }
}
