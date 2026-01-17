<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent tracking-tight">
          AgriTech Dashboard
        </h1>
        <p class="text-gray-600 mt-2">Monitor your systems in real-time</p>
      </header>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl p-6 border border-black/5 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div class="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="system in systems"
          :key="system.id"
          class="system-card bg-white rounded-2xl p-6 border border-black/5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          @click="goToSystem(system.id)"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ system.name }}</h3>
              <p class="text-sm text-gray-500">{{ system.device_id }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'w-2 h-2 rounded-full',
                  getStatusColor(system.lastData)
                ]"
              ></span>
              <span class="text-xs text-gray-500">{{ getStatusText(system.lastData) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4" v-if="system.lastData">
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4">
              <div class="text-2xl font-bold text-emerald-600">{{ system.lastData.soil_moisture }}%</div>
              <div class="text-xs text-gray-600 mt-1">Soil Moisture</div>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
              <div class="text-2xl font-bold text-blue-600">{{ system.lastData.soil_ph }}</div>
              <div class="text-xs text-gray-600 mt-1">Soil pH</div>
            </div>

            <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4">
              <div class="text-2xl font-bold text-amber-600">{{ system.lastData.air_temp }}°C</div>
              <div class="text-xs text-gray-600 mt-1">Temperature</div>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
              <div class="text-2xl font-bold text-purple-600">{{ system.lastData.battery }}%</div>
              <div class="text-xs text-gray-600 mt-1">Battery</div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-400">
            No data available
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>Last updated</span>
              <span>{{ formatTime(system.lastData?.created_at) }}</span>
            </div>
          </div>
        </div>

        <div
          class="system-card bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-dashed border-emerald-300 hover:border-emerald-400 transition-all duration-300 cursor-pointer flex items-center justify-center"
          @click="showAddSystem = true"
        >
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-emerald-700">Add New System</h3>
            <p class="text-sm text-emerald-600 mt-1">Configure a new monitoring system</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showAddSystem"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showAddSystem = false"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Add New System</h2>
        
        <form @submit.prevent="addSystem">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">System Name</label>
            <input
              v-model="newSystem.name"
              type="text"
              required
              placeholder="e.g., North Field"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Device ID</label>
            <input
              v-model="newSystem.device_id"
              type="text"
              required
              placeholder="e.g., NODE_12"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showAddSystem = false"
              class="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Add System
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { systemService } from '../services/api';
import gsap from 'gsap';

const router = useRouter();
const systems = ref([]);
const loading = ref(true);
const showAddSystem = ref(false);
const newSystem = ref({
  name: '',
  device_id: ''
});

const fetchSystems = async () => {
  try {
    const data = await systemService.getAll();
    systems.value = data;
  } catch (error) {
    console.error('Failed to fetch systems:', error);
  } finally {
    loading.value = false;
  }
};

const addSystem = async () => {
  try {
    await systemService.create(newSystem.value);
    showAddSystem.value = false;
    newSystem.value = { name: '', device_id: '' };
    await fetchSystems();
  } catch (error) {
    console.error('Failed to add system:', error);
  }
};

const goToSystem = (id) => {
  router.push(`/system/${id}`);
};

const getStatusColor = (data) => {
  if (!data) return 'bg-gray-400';
  const now = new Date();
  const lastUpdate = new Date(data.created_at);
  const diffMinutes = (now - lastUpdate) / 1000 / 60;
  
  if (diffMinutes < 20) return 'bg-emerald-500';
  if (diffMinutes < 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const getStatusText = (data) => {
  if (!data) return 'Offline';
  const now = new Date();
  const lastUpdate = new Date(data.created_at);
  const diffMinutes = (now - lastUpdate) / 1000 / 60;
  
  if (diffMinutes < 20) return 'Online';
  if (diffMinutes < 60) return 'Warning';
  return 'Offline';
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / 1000 / 60);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};

onMounted(async () => {
  await fetchSystems();
  
  gsap.from('.system-card', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out'
  });
});
</script>
