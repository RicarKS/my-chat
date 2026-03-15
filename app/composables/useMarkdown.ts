import DOMPurify from 'dompurify'

let mdInstance: any = null

export function useMarkdown() {
  const { $initMarkdown } = useNuxtApp()

  const render = async (content: string): Promise<string> => {
    if (!content) return ''

    if (!mdInstance && $initMarkdown) {
      mdInstance = await ($initMarkdown as () => Promise<any>)()
    }

    if (!mdInstance) {
      // Fallback: simple HTML escape + newlines
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
    }

    const raw = mdInstance.render(content)
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mover', 'munder', 'msqrt', 'mtable', 'mtr', 'mtd', 'mtext', 'annotation'],
      ADD_ATTR: ['xmlns', 'encoding', 'display', 'mathvariant', 'stretchy', 'fence', 'separator', 'accent', 'accentunder', 'columnalign', 'aria-hidden'],
    })
  }

  return { render }
}
