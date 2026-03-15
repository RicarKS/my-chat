<template>
  <div>
    <NuxtLayout name="auth">
      <div class="auth-container">
        <h1 class="auth-title">我的聊天</h1>
        <p class="auth-subtitle">请登录以继续</p>
        <LoginForm />
        <p class="auth-link">
          没有账号？ <NuxtLink to="/register">注册</NuxtLink>
        </p>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['guest'] })
</script>

<style scoped>
.auth-container {
  width: 100%;
  max-width: 380px;
  padding: 40px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.auth-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 4px;
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: 28px;
}

.auth-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
