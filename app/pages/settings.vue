<template>
  <div>
    <NuxtLayout name="default">
      <div class="settings-page">
        <div class="settings-header">
          <h1>设置</h1>
          <button class="btn btn-ghost btn-sm" @click="router.push('/chat')">返回聊天</button>
        </div>
        <div class="settings-content">
          <ModelConfigList />
          <ImportExportPanel />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
const router = useRouter()
</script>

<style scoped>
.settings-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 20px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.settings-header h1 {
  font-size: 22px;
  font-weight: 600;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
</style>
