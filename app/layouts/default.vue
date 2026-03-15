<template>
  <div class="app-layout">
    <aside v-show="showSidebar" class="sidebar-wrapper" :class="{ collapsed: sidebarCollapsed }">
      <AppSidebar :collapsed="false" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    </aside>
    <div class="app-main" :class="{ 'full-width': !showSidebar || sidebarCollapsed }">
      <button v-if="showSidebar && sidebarCollapsed" class="sidebar-open-btn" @click="sidebarCollapsed = false" title="打开侧边栏">
        &#9776;
      </button>
      <slot />
    </div>
    <div v-if="showSidebar && !sidebarCollapsed" class="sidebar-overlay-mobile" @click="sidebarCollapsed = true" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const sidebarCollapsed = ref(false)

const showSidebar = computed(() => {
  const authPages = ['/', '/register']
  return !authPages.includes(route.path) && authStore.isAuthenticated
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.sidebar-wrapper {
  width: var(--sidebar-width);
  flex-shrink: 0;
  overflow: hidden;
  transition: width var(--transition-normal);
}

.sidebar-wrapper.collapsed {
  width: 0;
}

.app-main {
  flex: 1;
  min-width: 0;
  position: relative;
}

.sidebar-open-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 40;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-open-btn:hover {
  color: var(--color-text);
  background: var(--color-bg-hover);
}

.sidebar-overlay-mobile {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-wrapper {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: var(--sidebar-width);
  }

  .sidebar-wrapper.collapsed {
    width: 0;
  }

  .sidebar-overlay-mobile {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }
}
</style>
