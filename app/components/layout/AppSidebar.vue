<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <h2 class="sidebar-title">我的聊天</h2>
      <button class="btn-icon toggle-btn" @click="$emit('toggle')">
        <span class="icon">{{ collapsed ? '&#9776;' : '&#10005;' }}</span>
      </button>
    </div>

    <NewChatButton />

    <div class="sidebar-content">
      <ConversationList />
    </div>

    <div class="sidebar-footer">
      <button class="btn btn-ghost btn-sm sidebar-btn" @click="goToSettings">
        设置
      </button>
      <button class="btn btn-ghost btn-sm sidebar-btn" @click="handleLogout">
        退出登录
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean }>()
defineEmits<{ toggle: [] }>()

const { logout } = useAuth()
const router = useRouter()

function goToSettings() {
  router.push('/settings')
}

function handleLogout() {
  logout()
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-normal);
  z-index: 100;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
}

.toggle-btn {
  color: var(--color-text-secondary);
}

.toggle-btn:hover {
  color: var(--color-text);
}

.icon {
  font-size: 18px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
}

.sidebar-btn {
  flex: 1;
  justify-content: center;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    max-width: 300px;
  }
}
</style>
