<template>
  <div class="message-text" v-html="renderedHtml" />
</template>

<script setup lang="ts">
const props = defineProps<{ content: string }>()
const { render } = useMarkdown()

const renderedHtml = ref('')

// Simple fallback for SSR / before markdown loads
const fallback = computed(() => {
  if (!props.content) return ''
  return props.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
})

watch(() => props.content, async (content) => {
  if (!content) {
    renderedHtml.value = ''
    return
  }
  try {
    renderedHtml.value = await render(content)
  } catch {
    renderedHtml.value = fallback.value
  }
}, { immediate: true })
</script>

<style scoped>
.message-text {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Markdown rendered content styles */
.message-text :deep(pre) {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
  font-size: 13px;
  line-height: 1.5;
}

.message-text :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.message-text :deep(:not(pre) > code) {
  background: var(--color-bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}

.message-text :deep(p) {
  margin-bottom: 12px;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  padding-left: 24px;
  margin-bottom: 12px;
}

.message-text :deep(li) {
  margin-bottom: 4px;
}

.message-text :deep(blockquote) {
  border-left: 3px solid var(--color-border-light);
  padding-left: 16px;
  color: var(--color-text-secondary);
  margin: 12px 0;
}

.message-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.message-text :deep(th),
.message-text :deep(td) {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  text-align: left;
}

.message-text :deep(th) {
  background: var(--color-bg-tertiary);
  font-weight: 600;
}

.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3),
.message-text :deep(h4) {
  margin: 16px 0 8px;
  font-weight: 600;
}

.message-text :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 16px 0;
}

.message-text :deep(.katex-block) {
  text-align: center;
  margin: 16px 0;
  overflow-x: auto;
}

.message-text :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}

.message-text :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
}

/* Shiki code block styling */
.message-text :deep(.shiki) {
  background: var(--color-bg-tertiary) !important;
  border-radius: var(--radius-md);
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
}
</style>
