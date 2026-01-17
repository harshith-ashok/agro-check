<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent tracking-tight mb-2">
          AgriTech
        </h1>
        <p class="text-gray-600">Monitor and optimize your agricultural systems</p>
      </div>

      <div class="bg-white rounded-2xl p-8 shadow-2xl border border-black/5">
        <div class="mb-6 flex border-b border-gray-200">
          <button
            @click="isLogin = true"
            :class="[
              'flex-1 py-3 font-medium transition-all',
              isLogin
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Login
          </button>
          <button
            @click="isLogin = false"
            :class="[
              'flex-1 py-3 font-medium transition-all',
              !isLogin
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Register
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div v-if="!isLogin" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              :required="!isLogin"
              placeholder="John Doe"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {{ loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/api';

const router = useRouter();
const isLogin = ref(true);
const loading = ref(false);
const error = ref('');

const form = ref({
  name: '',
  email: '',
  password: ''
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    if (isLogin.value) {
      await authService.login(form.value.email, form.value.password);
    } else {
      await authService.register(form.value.name, form.value.email, form.value.password);
    }
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
