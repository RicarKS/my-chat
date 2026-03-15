<template>
  <div class="app-layout">
    <AppSidebar v-if="showSidebar" :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <div class="app-main" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'no-sidebar': !showSidebar }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const showSidebar = ref(true)
const sidebarCollapsed = ref(false)
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.app-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-main.sidebar-collapsed {
  margin-left: 0;
}

.app-main.no-sidebar {
  margin-left: 0;
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 0;
  }
}
</style>
