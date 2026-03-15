<template>
  <form class="register-form" @submit.prevent="handleSubmit">
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
        placeholder="请输入密码（至少6位）"
        autocomplete="new-password"
        required
      />
    </div>
    <div class="form-group">
      <label class="form-label" for="confirm">确认密码</label>
      <input
        id="confirm"
        v-model="confirmPassword"
        class="input-field"
        type="password"
        placeholder="请确认密码"
        autocomplete="new-password"
        required
      />
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
    <button class="btn btn-primary submit-btn" type="submit" :disabled="loading">
      {{ loading ? '创建中...' : '创建账号' }}
    </button>
  </form>
</template>

<script setup lang="ts">
const { register } = useAuth()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }

  if (password.value.length < 6) {
    error.value = '密码至少需要6个字符'
    return
  }

  loading.value = true
  try {
    await register(username.value, password.value)
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
