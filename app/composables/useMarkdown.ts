import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'

const externalLinkIcon = `<svg class="inline-block ml-1 w-3 h-3 text-orange-500 dark:text-orange-400" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M808 428.8V720c0 22.4-17.6 40-40 40s-40-17.6-40-40V528L444.8 812.8c-8 8-17.6 11.2-28.8 11.2s-20.8-3.2-28.8-11.2c-16-16-16-41.6 0-56L672 472H480c-22.4 0-40-17.6-40-40s17.6-40 40-40h296c1.6 0 3.2 1.6 4.8 1.6 1.6 0 1.6 0 3.2 1.6 1.6 0 3.2 1.6 4.8 1.6 1.6 0 1.6 1.6 3.2 1.6 1.6 1.6 4.8 3.2 6.4 4.8 1.6 1.6 3.2 3.2 4.8 6.4l1.6 1.6c1.6 1.6 1.6 3.2 1.6 4.8 0 1.6 0 1.6 1.6 3.2 0 1.6 1.6 3.2 1.6 4.8-1.6 1.6-1.6 3.2-1.6 4.8z m152-64v486.4c0 68.8-56 124.8-124.8 124.8H348.8c-68.8 0-124.8-56-124.8-124.8V364.8c0-68.8 56-124.8 124.8-124.8h486.4c68.8-1.6 124.8 56 124.8 124.8z m-80 0c0-25.6-20.8-44.8-44.8-44.8H348.8c-25.6 0-44.8 20.8-44.8 44.8v486.4c0 25.6 20.8 44.8 44.8 44.8h486.4c25.6 0 44.8-20.8 44.8-44.8V364.8zM790.4 112c0-22.4-17.6-40-40-40H208c-83.2 0-152 67.2-152 152v542.4c0 22.4 17.6 40 40 40s40-17.6 40-40V224c0-40 32-72 72-72h542.4c22.4 0 40-17.6 40-40z" fill="currentColor"></path></svg>`

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

  // 自定义链接渲染：添加下划线 + 外链图标
  const defaultLinkOpen = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const hrefIdx = token.attrIndex('href')
    const href = hrefIdx >= 0 ? token.attrs![hrefIdx][1] : ''
    const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'))

    if (isExternal) {
      token.attrPush(['target', '_blank'])
      token.attrPush(['rel', 'noopener noreferrer'])
      token.attrPush(['class', 'underline decoration-orange-500 dark:decoration-orange-400 hover:decoration-orange-700 dark:hover:decoration-orange-300 transition-all'])
    }

    const html = defaultLinkOpen(tokens, idx, options, env, self)
    return isExternal ? html.replace('</a>', `${externalLinkIcon}</a>`) : html
  }

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
