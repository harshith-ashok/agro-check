<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'

const router = useRouter()

const mode = ref<'login' | 'register'>('login')
const identityCode = ref('')
const email = ref('')
const name = ref('')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const generatedCode = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const response = await authAPI.login(identityCode.value.toUpperCase())

    // Backend returns user object directly
    localStorage.setItem('user', JSON.stringify(response))
    localStorage.setItem('userId', response.id.toString())

    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Invalid identity code'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  error.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const response = await authAPI.register({
      email: email.value || undefined,
      name: name.value || undefined
    })

    // Backend returns { identity_code }
    generatedCode.value = response.identity_code
    successMessage.value = `Registration successful! Your identity code is: ${generatedCode.value}. Please save it securely.`

    email.value = ''
    name.value = ''
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Registration failed'
  } finally {
    loading.value = false
  }
}

const copyCode = () => {
  navigator.clipboard.writeText(generatedCode.value)
  alert('Identity code copied to clipboard!')
}

const switchToLogin = () => {
  mode.value = 'login'
  error.value = ''
  successMessage.value = ''
  identityCode.value = generatedCode.value
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-blue-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AgriTech</h1>
        <p class="text-gray-600">Multi-Region Farm Monitoring</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-6">
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="mode = 'login'"
            :class="[
              'px-4 py-2.5 rounded-xl font-medium transition-all',
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Login
          </button>
          <button
            @click="mode = 'register'"
            :class="[
              'px-4 py-2.5 rounded-xl font-medium transition-all',
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Register
          </button>
        </div>
      </div>

      <!-- Login -->
      <div v-if="mode === 'login'" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <input
            v-model="identityCode"
            type="text"
            placeholder="Enter your 6-digit code"
            maxlength="6"
            required
            class="w-full px-4 py-3 border border-gray-200 rounded-xl text-center uppercase tracking-widest font-mono"
          />

          <button
            type="submit"
            :disabled="loading || identityCode.length !== 6"
            class="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {{ error }}
        </div>
      </div>

      <!-- Register -->
      <div v-if="mode === 'register'" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>

        <form v-if="!successMessage" @submit.prevent="handleRegister" class="space-y-4">
          <input v-model="name" placeholder="Name (optional)" class="w-full px-4 py-3 border rounded-xl" />
          <input v-model="email" placeholder="Email (optional)" class="w-full px-4 py-3 border rounded-xl" />

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl"
          >
            {{ loading ? 'Generating...' : 'Generate Identity Code' }}
          </button>
        </form>

        <!-- Success -->
        <div v-if="successMessage" class="space-y-4">
          <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p class="text-emerald-800 font-medium">{{ successMessage }}</p>
            <p class="text-3xl font-mono mt-2 tracking-widest">{{ generatedCode }}</p>
          </div>

          <button
            @click="switchToLogin"
            class="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl"
          >
            Continue to Login
          </button>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {{ error }}
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped></style>
