import MarkdownIt from 'markdown-it'
import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'

let md: MarkdownIt | null = null
let highlighterPromise: Promise<any> | null = null

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import('shiki/themes/github-dark.mjs')],
      langs: [
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/python.mjs'),
        import('shiki/langs/bash.mjs'),
        import('shiki/langs/json.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/css.mjs'),
        import('shiki/langs/sql.mjs'),
        import('shiki/langs/yaml.mjs'),
        import('shiki/langs/markdown.mjs'),
        import('shiki/langs/go.mjs'),
        import('shiki/langs/rust.mjs'),
        import('shiki/langs/java.mjs'),
        import('shiki/langs/cpp.mjs'),
        import('shiki/langs/c.mjs'),
        import('shiki/langs/shell.mjs'),
        import('shiki/langs/dockerfile.mjs'),
      ],
      engine: createOnigurumaEngine(import('shiki/wasm')),
    })
  }
  return highlighterPromise
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function initMarkdown() {
  if (md) return md

  const highlighter = await getHighlighter()
  const loadedLangs = highlighter.getLoadedLanguages()

  md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight(str: string, lang: string) {
      const normalizedLang = lang.toLowerCase().trim()
      if (normalizedLang && loadedLangs.includes(normalizedLang)) {
        try {
          return highlighter.codeToHtml(str, {
            lang: normalizedLang,
            theme: 'github-dark',
          })
        } catch { /* fallback */ }
      }
      return `<pre class="shiki"><code>${escapeHtml(str)}</code></pre>`
    },
  })

  // KaTeX inline/block rendering
  const katexModule = await import('katex')
  const katex = katexModule.default || katexModule

  // Add inline math rule: $...$
  md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
    if (state.src[state.pos] !== '$') return false
    if (state.src[state.pos + 1] === '$') return false // skip block

    const start = state.pos + 1
    let end = start
    while (end < state.posMax && state.src[end] !== '$') end++
    if (end >= state.posMax) return false

    if (!silent) {
      const token = state.push('math_inline', 'math', 0)
      token.content = state.src.slice(start, end)
    }
    state.pos = end + 1
    return true
  })

  md.renderer.rules.math_inline = (tokens, idx) => {
    try {
      return katex.renderToString(tokens[idx].content, { throwOnError: false, displayMode: false })
    } catch {
      return `<code>${escapeHtml(tokens[idx].content)}</code>`
    }
  }

  // Block math: $$...$$
  md.block.ruler.after('fence', 'math_block', (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine]
    if (state.src.slice(startPos, startPos + 2) !== '$$') return false

    if (silent) return true

    let nextLine = startLine + 1
    while (nextLine < endLine) {
      const pos = state.bMarks[nextLine] + state.tShift[nextLine]
      if (state.src.slice(pos, pos + 2) === '$$') break
      nextLine++
    }

    const content = state.getLines(startLine + 1, nextLine, state.tShift[startLine], false).trim()
    const token = state.push('math_block', 'math', 0)
    token.content = content
    token.map = [startLine, nextLine + 1]
    state.line = nextLine + 1
    return true
  })

  md.renderer.rules.math_block = (tokens, idx) => {
    try {
      return `<div class="katex-block">${katex.renderToString(tokens[idx].content, { throwOnError: false, displayMode: true })}</div>`
    } catch {
      return `<pre>${escapeHtml(tokens[idx].content)}</pre>`
    }
  }

  return md
}

export default defineNuxtPlugin(async () => {
  // Pre-initialize markdown on client side
  await initMarkdown()

  return {
    provide: {
      initMarkdown,
    },
  }
})
