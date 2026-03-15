<template>
  <div class="import-export-panel">
    <h2>导入 / 导出</h2>

    <div class="panel-section">
      <h3>导出当前对话</h3>
      <div v-if="currentConversation" class="export-actions">
        <p class="current-name">{{ currentConversation.title }}</p>
        <div class="btn-row">
          <button class="btn btn-sm btn-ghost" @click="handleExport('json')">JSON</button>
          <button class="btn btn-sm btn-ghost" @click="handleExport('md')">Markdown</button>
          <button class="btn btn-sm btn-ghost" @click="handleExport('txt')">Text</button>
        </div>
      </div>
      <p v-else class="muted">未选择对话</p>
    </div>

    <div class="panel-section">
      <h3>导入对话</h3>
      <p class="hint">上传 JSON 导出文件</p>
      <input type="file" accept=".json" class="file-input" @change="handleImport" />
      <p v-if="importStatus" :class="importStatus.type === 'error' ? 'error-text' : 'success-text'">
        {{ importStatus.message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const conversationsStore = useConversationsStore()
const { exportConversation, importConversation } = useImportExport()

const currentConversation = computed(() => conversationsStore.current)
const importStatus = ref<{ type: 'error' | 'success'; message: string } | null>(null)

async function handleExport(format: 'json' | 'md' | 'txt') {
  if (!currentConversation.value) return
  try {
    await exportConversation(currentConversation.value.id, format)
  } catch (e: any) {
    console.error('Export failed:', e)
  }
}

async function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  importStatus.value = null
  try {
    const convo = await importConversation(file)
    importStatus.value = { type: 'success', message: `已导入：${convo.title}` }
  } catch (err: any) {
    importStatus.value = { type: 'error', message: err.message || '导入失败' }
  }
}
</script>

<style scoped>
.import-export-panel h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.panel-section {
  padding: 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}

.panel-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.current-name {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.btn-row {
  display: flex;
  gap: 8px;
}

.hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.muted {
  font-size: 13px;
  color: var(--color-text-muted);
}

.file-input {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.success-text {
  color: var(--color-success);
  font-size: 13px;
  margin-top: 8px;
}
</style>
