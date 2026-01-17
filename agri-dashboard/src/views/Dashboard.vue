<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-4xl bg-gradient-to-r from-emerald-600 to-emerald-500 pb-1 tracking-wide uppercase font-black bg-clip-text text-transparent tracking-tight">
              AgroCheck
            </h1>
            <p class="text-gray-600 mt-2">Monitor your systems in real-time</p>
          </div>
          <button
            @click="showAddSystem = true"
            class="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add System
          </button>
        </div>

        <!-- Overview Stats -->
        <div v-if="!loading && systems.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="overview-card bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-indigo-100 text-sm font-medium">Total Systems</span>
              <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold">{{ systems.length }}</div>
            <div class="text-sm text-indigo-100 mt-1">
              {{ onlineSystemsCount }} online
            </div>
          </div>

          <div class="overview-card bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-600 text-sm font-medium">Avg Moisture</span>
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-gray-900">{{ averageStats.moisture }}%</div>
            <div :class="['text-sm mt-1 font-medium', averageStats.moisture < 45 ? 'text-amber-600' : 'text-emerald-600']">
              {{ averageStats.moisture < 45 ? 'Needs attention' : 'Healthy range' }}
            </div>
          </div>

          <div class="overview-card bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-600 text-sm font-medium">Avg Temperature</span>
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-gray-900">{{ averageStats.temp }}°C</div>
            <div :class="['text-sm mt-1 font-medium', averageStats.temp > 35 ? 'text-red-600' : 'text-gray-600']">
              {{ averageStats.temp > 35 ? 'High temperature' : 'Normal range' }}
            </div>
          </div>

          <div class="overview-card bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-600 text-sm font-medium">Avg Battery</span>
              <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-gray-900">{{ averageStats.battery }}%</div>
            <div :class="['text-sm mt-1 font-medium', averageStats.battery < 40 ? 'text-amber-600' : 'text-emerald-600']">
              {{ averageStats.battery < 40 ? 'Monitor charging' : 'Good condition' }}
            </div>
          </div>
        </div>
      </header>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl p-6 border border-black/5 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div class="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div v-else>
        <div v-if="systems.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Systems Yet</h3>
          <p class="text-gray-600 mb-6">Get started by adding your first monitoring system</p>
          <button
            @click="showAddSystem = true"
            class="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Add Your First System
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="system in systems"
            :key="system.id"
            class="system-card bg-white rounded-2xl p-6 border border-black/5 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 relative group"
          >
            <button
              @click.stop="confirmDelete(system)"
              class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
              title="Delete system"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>

            <div @click="goToSystem(system.id)" class="cursor-pointer">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900">{{ system.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ system.device_id }}</p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'w-2 h-2 rounded-full',
                      getStatusColor(system.lastData)
                    ]"
                  ></span>
                  <span class="text-xs font-medium text-gray-600">{{ getStatusText(system.lastData) }}</span>
                </div>
                <span class="text-xs text-gray-400">{{ formatTime(system.lastData?.created_at) }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4" v-if="system.lastData">
              <div :class="[
                'rounded-xl p-3 relative transition-all hover:scale-105',
                getMoistureStatus(system.lastData.soil_moisture).bgClass
              ]">
                <div :class="['text-xl font-bold', getMoistureStatus(system.lastData.soil_moisture).textClass]">
                  {{ system.lastData.soil_moisture }}%
                </div>
                <div class="text-xs text-gray-600 mt-1">Soil Moisture</div>
                <div v-if="getMoistureStatus(system.lastData.soil_moisture).warning" 
                     class="absolute top-2 right-2">
                  <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div :class="[
                'rounded-xl p-3 relative transition-all hover:scale-105',
                getPhStatus(system.lastData.soil_ph).bgClass
              ]">
                <div :class="['text-xl font-bold', getPhStatus(system.lastData.soil_ph).textClass]">
                  {{ system.lastData.soil_ph }}
                </div>
                <div class="text-xs text-gray-600 mt-1">Soil pH</div>
                <div v-if="getPhStatus(system.lastData.soil_ph).warning" 
                     class="absolute top-2 right-2">
                  <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div :class="[
                'rounded-xl p-3 relative transition-all hover:scale-105',
                getTempStatus(system.lastData.air_temp).bgClass
              ]">
                <div :class="['text-xl font-bold', getTempStatus(system.lastData.air_temp).textClass]">
                  {{ system.lastData.air_temp }}°C
                </div>
                <div class="text-xs text-gray-600 mt-1">Temperature</div>
                <div v-if="getTempStatus(system.lastData.air_temp).warning" 
                     class="absolute top-2 right-2">
                  <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div :class="[
                'rounded-xl p-3 relative transition-all hover:scale-105',
                getBatteryStatus(system.lastData.battery).bgClass
              ]">
                <div :class="['text-xl font-bold', getBatteryStatus(system.lastData.battery).textClass]">
                  {{ system.lastData.battery }}%
                </div>
                <div class="text-xs text-gray-600 mt-1">Battery</div>
                <div v-if="getBatteryStatus(system.lastData.battery).warning" 
                     class="absolute top-2 right-2">
                  <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
              No data available
            </div>

            <div class="pt-4 border-t border-gray-100">
              <div v-if="getSystemRecommendations(system.lastData).length > 0" class="space-y-2">
                <div class="text-xs font-semibold text-gray-700 mb-3">Action Items</div>
                <div class="grid grid-cols-1 gap-2">
                  <div v-for="(rec, idx) in getSystemRecommendations(system.lastData).slice(0, 2)" :key="idx"
                       :class="['text-xs py-2 px-3 rounded-lg font-medium border', rec.class]">
                    {{ rec.message }}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showAddSystem"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showAddSystem = false"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
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

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Delete System</h2>
            <p class="text-sm text-gray-600 mt-1">This action cannot be undone</p>
          </div>
        </div>
        
        <p class="text-gray-700 mb-6">
          Are you sure you want to delete <strong>{{ systemToDelete?.name }}</strong>? 
          All historical data for this system will be permanently removed.
        </p>

        <div class="flex gap-3">
          <button
            type="button"
            @click="showDeleteConfirm = false"
            class="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="deleteSystem"
            class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
          >
            Delete System
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { systemService } from '../services/api';
import gsap from 'gsap';

const router = useRouter();
const systems = ref([]);
const loading = ref(true);
const showAddSystem = ref(false);
const showDeleteConfirm = ref(false);
const systemToDelete = ref(null);
const newSystem = ref({
  name: '',
  device_id: ''
});

const onlineSystemsCount = computed(() => {
  return systems.value.filter(s => {
    if (!s.lastData) return false;
    const now = new Date();
    const lastUpdate = new Date(s.lastData.created_at);
    const diffMinutes = (now - lastUpdate) / 1000 / 60;
    return diffMinutes < 20;
  }).length;
});

const averageStats = computed(() => {
  const systemsWithData = systems.value.filter(s => s.lastData);
  if (systemsWithData.length === 0) {
    return { moisture: 0, temp: 0, battery: 0, ph: 0 };
  }
  
  const sum = systemsWithData.reduce((acc, s) => ({
    moisture: acc.moisture + s.lastData.soil_moisture,
    temp: acc.temp + s.lastData.air_temp,
    battery: acc.battery + s.lastData.battery,
    ph: acc.ph + s.lastData.soil_ph
  }), { moisture: 0, temp: 0, battery: 0, ph: 0 });
  
  return {
    moisture: Math.round(sum.moisture / systemsWithData.length),
    temp: Math.round(sum.temp / systemsWithData.length * 10) / 10,
    battery: Math.round(sum.battery / systemsWithData.length),
    ph: Math.round(sum.ph / systemsWithData.length * 10) / 10
  };
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
    
    await nextTick();
    animateCards();
  } catch (error) {
    console.error('Failed to add system:', error);
  }
};

const goToSystem = (id) => {
  router.push(`/system/${id}`);
};

const confirmDelete = (system) => {
  systemToDelete.value = system;
  showDeleteConfirm.value = true;
};

const deleteSystem = async () => {
  try {
    await systemService.delete(systemToDelete.value.id);
    showDeleteConfirm.value = false;
    systemToDelete.value = null;
    await fetchSystems();
    
    await nextTick();
    animateCards();
  } catch (error) {
    console.error('Failed to delete system:', error);
    alert('Failed to delete system');
  }
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

const getMoistureStatus = (moisture) => {
  if (moisture < 30) {
    return {
      bgClass: 'bg-gradient-to-br from-red-50 to-red-100/50',
      textClass: 'text-red-600',
      warning: true
    };
  } else if (moisture < 45) {
    return {
      bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
      textClass: 'text-amber-600',
      warning: true
    };
  } else if (moisture > 80) {
    return {
      bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      textClass: 'text-blue-600',
      warning: true
    };
  }
  return {
    bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    textClass: 'text-emerald-600',
    warning: false
  };
};

const getPhStatus = (ph) => {
  if (ph < 5.5 || ph > 7.5) {
    return {
      bgClass: 'bg-gradient-to-br from-red-50 to-red-100/50',
      textClass: 'text-red-600',
      warning: true
    };
  } else if (ph < 6.0 || ph > 7.0) {
    return {
      bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
      textClass: 'text-amber-600',
      warning: true
    };
  }
  return {
    bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    textClass: 'text-emerald-600',
    warning: false
  };
};

const getTempStatus = (temp) => {
  if (temp < 10 || temp > 40) {
    return {
      bgClass: 'bg-gradient-to-br from-red-50 to-red-100/50',
      textClass: 'text-red-600',
      warning: true
    };
  } else if (temp < 15 || temp > 35) {
    return {
      bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
      textClass: 'text-amber-600',
      warning: true
    };
  }
  return {
    bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    textClass: 'text-emerald-600',
    warning: false
  };
};

const getBatteryStatus = (battery) => {
  if (battery < 20) {
    return {
      bgClass: 'bg-gradient-to-br from-red-50 to-red-100/50',
      textClass: 'text-red-600',
      warning: true
    };
  } else if (battery < 40) {
    return {
      bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
      textClass: 'text-amber-600',
      warning: true
    };
  }
  return {
    bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    textClass: 'text-emerald-600',
    warning: false
  };
};

const getSystemRecommendations = (data) => {
  if (!data) return [];
  const recommendations = [];
  
  if (data.soil_moisture < 30) {
    recommendations.push({
      message: 'Start irrigation immediately - critical moisture level',
      class: 'bg-red-50 text-red-700 border-red-200'
    });
  } else if (data.soil_moisture < 45) {
    recommendations.push({
      message: 'Schedule irrigation within 24 hours',
      class: 'bg-amber-50 text-amber-700 border-amber-200'
    });
  } else if (data.soil_moisture > 80) {
    recommendations.push({
      message: 'Reduce watering frequency to prevent root issues',
      class: 'bg-blue-50 text-blue-700 border-blue-200'
    });
  }
  
  if (data.soil_ph < 5.5) {
    recommendations.push({
      message: 'Apply lime to increase pH to optimal range',
      class: 'bg-red-50 text-red-700 border-red-200'
    });
  } else if (data.soil_ph > 7.5) {
    recommendations.push({
      message: 'Apply sulfur to decrease pH to optimal range',
      class: 'bg-red-50 text-red-700 border-red-200'
    });
  } else if (data.soil_ph < 6.0 || data.soil_ph > 7.0) {
    recommendations.push({
      message: 'Monitor pH levels - slightly off optimal',
      class: 'bg-amber-50 text-amber-700 border-amber-200'
    });
  }
  
  if (data.air_temp > 40) {
    recommendations.push({
      message: 'Provide shade and cooling - extreme heat detected',
      class: 'bg-red-50 text-red-700 border-red-200'
    });
  } else if (data.air_temp < 10) {
    recommendations.push({
      message: 'Protect crops from frost damage immediately',
      class: 'bg-red-50 text-red-700 border-red-200'
    });
  } else if (data.air_temp > 35) {
    recommendations.push({
      message: 'Increase watering frequency due to high temperature',
      class: 'bg-amber-50 text-amber-700 border-amber-200'
    });
  }
  
  if (data.battery < 20) {
    recommendations.push({
      message: 'Check solar panel connection - critical battery',
      class: 'bg-red-50 text-red-700 border-red-200'
    });
  } else if (data.battery < 40) {
    recommendations.push({
      message: 'Monitor charging rate - low battery warning',
      class: 'bg-amber-50 text-amber-700 border-amber-200'
    });
  }
  
  if (data.humidity > 85 && data.air_temp > 25) {
    recommendations.push({
      message: 'High disease risk - inspect crops for fungal issues',
      class: 'bg-amber-50 text-amber-700 border-amber-200'
    });
  }
  
  return recommendations;
};

const animateCards = () => {
  gsap.fromTo('.system-card', 
    {
      opacity: 0,
      y: 30
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    }
  );

  gsap.fromTo('.overview-card', 
    {
      opacity: 0,
      scale: 0.9
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }
  );
};

onMounted(async () => {
  await fetchSystems();
  
  await nextTick();
  animateCards();
});
</script>