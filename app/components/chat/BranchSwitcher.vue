<template>
  <div class="branch-switcher">
    <button
      class="branch-btn"
      :disabled="index <= 0"
      @click="switchBranch('prev')"
    >&lt;</button>
    <span class="branch-label">{{ index + 1 }}/{{ count }}</span>
    <button
      class="branch-btn"
      :disabled="index >= count - 1"
      @click="switchBranch('next')"
    >&gt;</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  count: number
  index: number
  conversationId: string
  parentId: string | null
}>()

const { switchBranch: doSwitch } = useBranchNavigation()

function switchBranch(direction: 'prev' | 'next') {
  doSwitch(props.conversationId, props.parentId, direction)
}
</script>

<style scoped>
.branch-switcher {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.branch-btn {
  padding: 2px 6px;
  font-size: 12px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.branch-btn:hover:not(:disabled) {
  color: var(--color-text);
  background: var(--color-bg-hover);
}

.branch-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.branch-label {
  min-width: 30px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
</style>
