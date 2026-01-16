<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { systemsAPI, sensorsAPI, type System } from '../services/api'

const router = useRouter()

const systems = ref<System[]>([])
const selectedRegion = ref<string>('all')
const loading = ref(true)
const error = ref('')
const userId = ref<number | null>(null)

onMounted(async () => {
  // Check if user is logged in
  const userIdStr = localStorage.getItem('userId')
  if (!userIdStr) {
    router.push('/login')
    return
  }

  userId.value = parseInt(userIdStr)
  await fetchSystems()
  
  // Fetch fresh sensor data for all systems
  await fetchAllSensorData()
})

const fetchSystems = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await systemsAPI.getUserSystems(userId.value!)
    if (response.success) {
      systems.value = response.systems
    } else {
      error.value = 'Failed to load systems'
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load systems'
  } finally {
    loading.value = false
  }
}

const fetchAllSensorData = async () => {
  try {
    await sensorsAPI.fetchAllSensorData(userId.value!)
    // Refresh systems to get updated sensor data
    await fetchSystems()
  } catch (err) {
    console.error('Failed to fetch sensor data:', err)
  }
}

const regions = computed(() => {
  const uniqueRegions = [...new Set(systems.value.map(s => s.region))]
  return ['all', ...uniqueRegions]
})

const filteredSystems = computed(() => {
  if (selectedRegion.value === 'all') {
    return systems.value
  }
  return systems.value.filter(s => s.region === selectedRegion.value)
})

const stats = computed(() => {
  const filtered = filteredSystems.value
  if (filtered.length === 0) {
    return {
      total: 0,
      online: 0,
      warning: 0,
      offline: 0,
      avgSoilMoisture: 0,
      avgCropHealth: 0,
      avgBattery: 0,
    }
  }

  const onlineCount = filtered.filter(s => s.status === 'online').length
  const warningCount = filtered.filter(s => s.status === 'warning').length
  const offlineCount = filtered.filter(s => s.status === 'offline').length

  // Calculate averages from latest readings
  const systemsWithReadings = filtered.filter(s => s.latest_reading)
  const avgSoilMoisture = systemsWithReadings.length > 0
    ? Math.round(systemsWithReadings.reduce((acc, s) => acc + (s.latest_reading?.soil_moisture || 0), 0) / systemsWithReadings.length)
    : 0
  
  // Calculate crop health (normalized from soil moisture, pH, and humidity)
  const avgCropHealth = systemsWithReadings.length > 0
    ? Math.round(systemsWithReadings.reduce((acc, s) => {
        const sm = s.latest_reading?.soil_moisture || 0
        const ph = s.latest_reading?.soil_ph || 0
        const hum = s.latest_reading?.humidity || 0
        // Simple health formula: normalize values and average
        const health = ((sm / 100) * 40 + (Math.min(ph / 8, 1)) * 30 + (hum / 100) * 30) * 100 / 100
        return acc + Math.min(health * 100, 100)
      }, 0) / systemsWithReadings.length)
    : 0

  const avgBattery = systemsWithReadings.length > 0
    ? Math.round(systemsWithReadings.reduce((acc, s) => acc + ((s.latest_reading?.battery || 0) / 4.2 * 100), 0) / systemsWithReadings.length)
    : 0

  return {
    total: filtered.length,
    online: onlineCount,
    warning: warningCount,
    offline: offlineCount,
    avgSoilMoisture,
    avgCropHealth,
    avgBattery,
  }
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-emerald-100 text-emerald-800'
    case 'warning': return 'bg-amber-100 text-amber-800'
    case 'offline': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusDot = (status: string) => {
  switch (status) {
    case 'online': return 'bg-emerald-500'
    case 'warning': return 'bg-amber-500'
    case 'offline': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getTimeSince = (timestamp: string) => {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

const navigateToSystem = (id: number) => {
  router.push(`/system/${id}`)
}

const navigateToAddSystem = () => {
  router.push('/add-system')
}

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('userId')
  router.push('/login')
}

const refreshData = async () => {
  await fetchSystems()
  await fetchAllSensorData()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
    <!-- Header -->
    <div class="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-2 tracking-tight">
          AgriTech Systems
        </h1>
        <p class="text-gray-600 text-lg">Multi-region farm monitoring dashboard</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="refreshData"
          class="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
        <select 
          v-model="selectedRegion"
          class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        >
          <option v-for="region in regions" :key="region" :value="region">
            {{ region === 'all' ? 'All Regions' : region }}
          </option>
        </select>
        <button 
          @click="navigateToAddSystem"
          class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add System
        </button>
        <button
          @click="handleLogout"
          class="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading systems...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p class="text-red-700">{{ error }}</p>
      <button
        @click="fetchSystems"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-600 font-medium">Total Systems</h3>
            <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
          <div class="mt-3 flex gap-3 text-sm">
            <span class="text-emerald-600">{{ stats.online }} online</span>
            <span class="text-amber-600" v-if="stats.warning">{{ stats.warning }} warning</span>
            <span class="text-red-600" v-if="stats.offline">{{ stats.offline }} offline</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-600 font-medium">Avg Soil Moisture</h3>
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.avgSoilMoisture }}%</p>
          <div class="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div class="bg-emerald-500 h-2 rounded-full transition-all" :style="{ width: `${stats.avgSoilMoisture}%` }"></div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-600 font-medium">Avg Crop Health</h3>
            <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.avgCropHealth }}%</p>
          <div class="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full transition-all" :style="{ width: `${stats.avgCropHealth}%` }"></div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-600 font-medium">Avg Battery</h3>
            <div class="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-600">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.avgBattery }}%</p>
          <div class="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div class="bg-yellow-500 h-2 rounded-full transition-all" :style="{ width: `${stats.avgBattery}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Systems Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div 
          v-for="system in filteredSystems" 
          :key="system.id"
          @click="navigateToSystem(system.id)"
          class="bg-white rounded-2xl p-6 shadow-sm border border-black/5 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ system.name }}</h3>
              <p class="text-sm text-gray-500">{{ system.region }}</p>
            </div>
            <div :class="['px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5', getStatusColor(system.status)]">
              <div :class="['w-2 h-2 rounded-full', getStatusDot(system.status)]"></div>
              {{ system.status }}
            </div>
          </div>

          <!-- Metrics -->
          <div v-if="system.latest_reading" class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center p-3 bg-gray-50 rounded-xl">
              <p class="text-2xl font-bold text-gray-900">{{ Math.round(system.latest_reading.soil_moisture) }}%</p>
              <p class="text-xs text-gray-500 mt-1">Soil</p>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-xl">
              <p class="text-2xl font-bold text-gray-900">{{ system.latest_reading.soil_ph.toFixed(1) }}</p>
              <p class="text-xs text-gray-500 mt-1">pH</p>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-xl">
              <p class="text-2xl font-bold text-gray-900">{{ Math.round((system.latest_reading.battery / 4.2) * 100) }}%</p>
              <p class="text-xs text-gray-500 mt-1">Battery</p>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-400 text-sm">
            No sensor data available
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <span class="text-xs text-gray-500">
              {{ system.latest_reading ? `Updated ${getTimeSince(system.latest_reading.timestamp)}` : 'No data' }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredSystems.length === 0" class="text-center py-20">
        <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No systems found</h3>
        <p class="text-gray-500 mb-6">{{ selectedRegion === 'all' ? 'Get started by adding your first system' : 'No systems available in the selected region' }}</p>
        <button
          @click="navigateToAddSystem"
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Your First System
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>