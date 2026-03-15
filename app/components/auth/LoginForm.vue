<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label class="form-label" for="username">用户名</label>
      <input
        id="username"
        v-model="username"
        class="input-field"
        type="text"
        placeholder="请输入用户名"
        autocomplete="username"
        required
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="password">密码</label>
      <input
        id="password"
        v-model="password"
        class="input-field"
        type="password"
        placeholder="请输入密码"
        autocomplete="current-password"
        required
      />
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
    <button class="btn btn-primary submit-btn" type="submit" :disabled="loading">
      {{ loading ? '登录中...' : '登录' }}
    </button>
  </form>
</template>

<script setup lang="ts">
const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
