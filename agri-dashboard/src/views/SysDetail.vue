<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { systemsAPI, sensorsAPI, type System } from '../services/api'

Chart.register(...registerables)

const router = useRouter()
const route = useRoute()

const soilChartRef = ref<HTMLCanvasElement>()
const cropChartRef = ref<HTMLCanvasElement>()

const systemData = ref<System | null>(null)
const historicalData = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const showDeleteModal = ref(false)

let soilChart: Chart | null = null
let cropChart: Chart | null = null

onMounted(async () => {
  await fetchSystemData()
  await fetchHistoricalData()
  initializeCharts()
  
  // Fetch fresh sensor data
  if (systemData.value?.device_id) {
    await fetchFreshSensorData()
  }
})

const fetchSystemData = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await systemsAPI.getSystem(parseInt(route.params.id as string))
    if (response.success) {
      systemData.value = response.system
    } else {
      error.value = 'System not found'
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load system'
  } finally {
    loading.value = false
  }
}

const fetchHistoricalData = async () => {
  try {
    const response = await systemsAPI.getHistory(parseInt(route.params.id as string), 24, 7)
    if (response.success) {
      historicalData.value = response.readings
    }
  } catch (err) {
    console.error('Failed to fetch historical data:', err)
  }
}

const fetchFreshSensorData = async () => {
  try {
    await sensorsAPI.fetchSensorData(systemData.value!.device_id)
    await fetchSystemData()
    await fetchHistoricalData()
    updateCharts()
  } catch (err) {
    console.error('Failed to fetch fresh sensor data:', err)
  }
}

const initializeCharts = () => {
  if (!systemData.value?.latest_reading) return

  // Soil Moisture Donut Chart
  const soilMoisture = systemData.value.latest_reading.soil_moisture
  const remaining = 100 - soilMoisture

  soilChart = new Chart(soilChartRef.value!, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [soilMoisture, remaining],
        backgroundColor: ['#10b981', '#e5e7eb'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      cutout: '75%',
      plugins: {
        legend: {
          display: false
        }
      },
      animation: {
        duration: 1000
      }
    }
  })

  // Crop Health Trend Chart (from historical data)
  const ctx = cropChartRef.value!.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)')

  // Prepare historical data for chart
  const last24Hours = historicalData.value.slice(0, 24).reverse()
  const labels = last24Hours.map(r => {
    const date = new Date(r.timestamp)
    return date.getHours() + ':00'
  })
  
  const moistureData = last24Hours.map(r => r.soil_moisture)

  cropChart = new Chart(cropChartRef.value!, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [{
        data: moistureData.length > 0 ? moistureData : [0],
        borderColor: '#10b981',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          border: {
            display: false
          },
          grid: {
            color: '#f3f4f6'
          },
          ticks: {
            color: '#6b7280'
          }
        },
        x: {
          border: {
            display: false
          },
          grid: {
            display: false
          },
          ticks: {
            color: '#6b7280'
          }
        }
      },
      animation: {
        duration: 1500
      }
    }
  })
}

const updateCharts = () => {
  if (!systemData.value?.latest_reading) return

  // Update soil moisture chart
  if (soilChart && soilChart.data.datasets[0]) {
    const soilMoisture = systemData.value.latest_reading.soil_moisture
    const remaining = 100 - soilMoisture
    soilChart.data.datasets[0].data = [soilMoisture, remaining]
    soilChart.update()
  }

  // Update historical chart
  if (cropChart && cropChart.data.datasets[0] && historicalData.value.length > 0) {
    const last24Hours = historicalData.value.slice(0, 24).reverse()
    const labels = last24Hours.map(r => {
      const date = new Date(r.timestamp)
      return date.getHours() + ':00'
    })
    const moistureData = last24Hours.map(r => r.soil_moisture)
    
    cropChart.data.labels = labels
    cropChart.data.datasets[0].data = moistureData
    cropChart.update()
  }
}

const goBack = () => {
  router.push('/')
}

const confirmDelete = async () => {
  try {
    const response = await systemsAPI.deleteSystem(systemData.value!.id)
    if (response.success) {
      router.push('/')
    } else {
      error.value = 'Failed to delete system'
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to delete system'
  }
  showDeleteModal.value = false
}

const downloadReport = () => {
  // TODO: Implement report generation
  alert('Report download feature coming soon!')
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

const batteryPercentage = computed(() => {
  if (!systemData.value?.latest_reading) return 0
  return Math.round((systemData.value.latest_reading.battery / 4.2) * 100)
})

const temperatureStatus = computed(() => {
  if (!systemData.value?.latest_reading) return { class: 'text-gray-500', text: 'No data' }
  const temp = systemData.value.latest_reading.air_temp
  if (temp > 35) return { class: 'text-red-600', icon: '↗️', text: 'High' }
  if (temp < 15) return { class: 'text-blue-600', icon: '↘️', text: 'Low' }
  return { class: 'text-green-600', icon: '→', text: 'Normal' }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Loading system...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !systemData" class="max-w-2xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="systemData">
      <!-- Header -->
      <div class="mb-10">
        <button 
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </button>
        
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent tracking-tight">
                {{ systemData.name }}
              </h1>
              <div :class="['px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1.5', 
                systemData.status === 'online' ? 'bg-emerald-100 text-emerald-800' :
                systemData.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800']">
                <div :class="['w-2 h-2 rounded-full', 
                  systemData.status === 'online' ? 'bg-emerald-500' :
                  systemData.status === 'warning' ? 'bg-amber-500' :
                  'bg-red-500']"></div>
                {{ systemData.status }}
              </div>
            </div>
            <p class="text-gray-600 text-lg">{{ systemData.region }} • {{ systemData.crop_type || 'Farm' }}</p>
            <p class="text-gray-500 text-sm mt-1">
              {{ systemData.latest_reading ? `Last updated ${getTimeSince(systemData.latest_reading.timestamp)}` : 'No sensor data available' }}
            </p>
          </div>
          
          <div class="flex gap-3">
            <button 
              @click="fetchFreshSensorData"
              class="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
            <button 
              @click="downloadReport"
              class="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Report
            </button>
            <button 
              @click="showDeleteModal = true"
              class="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Soil Moisture Widget -->
        <div v-if="systemData.latest_reading" class="card bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5 col-span-1 md:col-span-2 lg:col-span-1">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900 tracking-tight">Soil Moisture</h2>
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
          </div>
          <div class="relative max-w-[220px] mx-auto mb-6">
            <canvas ref="soilChartRef"></canvas>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-5xl font-bold text-gray-900 leading-none">{{ Math.round(systemData.latest_reading.soil_moisture) }}%</span>
              <span class="text-sm text-gray-500 mt-1 font-medium">
                {{ systemData.latest_reading.soil_moisture > 60 ? 'Optimal' : systemData.latest_reading.soil_moisture > 40 ? 'Good' : 'Low' }}
              </span>
            </div>
          </div>
          <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            <span>{{ systemData.latest_reading.soil_moisture > 60 ? 'Irrigation not needed' : 'Consider irrigation' }}</span>
          </div>
        </div>

        <!-- Crop Health Widget -->
        <div class="card bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5 col-span-1 md:col-span-2 lg:col-span-2">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900 tracking-tight">Soil Moisture Trend (24h)</h2>
            <div class="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-lg text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              <span>{{ historicalData.length }} readings</span>
            </div>
          </div>
          <div class="h-72 mt-4">
            <canvas ref="cropChartRef"></canvas>
          </div>
        </div>

        <!-- System Status Widget -->
        <div v-if="systemData.latest_reading" class="card bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 tracking-tight">System Status</h2>
          </div>
          <div class="flex flex-col gap-5">
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                  <polyline points="17 2 12 7 7 2"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xl font-bold text-gray-900 leading-tight">{{ batteryPercentage }}%</p>
                <p class="text-sm text-gray-500 mt-0.5">Battery Level ({{ systemData.latest_reading.battery.toFixed(2) }}V)</p>
              </div>
              <div :class="['w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]',
                batteryPercentage > 70 ? 'bg-emerald-500' : batteryPercentage > 40 ? 'bg-amber-500' : 'bg-red-500'
              ]"></div>
            </div>
            
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xl font-bold text-gray-900 leading-tight">{{ systemData.latest_reading.soil_ph.toFixed(1) }}</p>
                <p class="text-sm text-gray-500 mt-0.5">Soil pH</p>
              </div>
              <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"></div>
            </div>
            
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xl font-bold text-gray-900 leading-tight">{{ systemData.latest_reading.air_temp.toFixed(1) }}°C</p>
                <p class="text-sm text-gray-500 mt-0.5">Temperature</p>
              </div>
              <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"></div>
            </div>
          </div>
        </div>

        <!-- Environmental Conditions Widget -->
        <div v-if="systemData.latest_reading" class="card bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5 col-span-1 md:col-span-2 lg:col-span-1">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 tracking-tight">Current Conditions</h2>
          </div>
          <div class="grid grid-cols-1 gap-6">
            <div class="text-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div class="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sky-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                </svg>
              </div>
              <p class="text-4xl font-bold text-gray-900 leading-none mb-2">{{ systemData.latest_reading.air_temp.toFixed(1) }}°C</p>
              <p class="text-sm text-gray-500 font-medium mb-3">Air Temperature</p>
              <div :class="['inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold',
                temperatureStatus.class.includes('red') ? 'bg-red-50 text-red-800' :
                temperatureStatus.class.includes('blue') ? 'bg-blue-50 text-blue-800' :
                'bg-emerald-50 text-emerald-800']">
                <span>{{ temperatureStatus.icon }} {{ temperatureStatus.text }}</span>
              </div>
            </div>
            
            <div class="text-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div class="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sky-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <p class="text-4xl font-bold text-gray-900 leading-none mb-2">{{ Math.round(systemData.latest_reading.humidity) }}%</p>
              <p class="text-sm text-gray-500 font-medium mb-3">Humidity</p>
              <div :class="['inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold',
                systemData.latest_reading.humidity > 80 ? 'bg-blue-50 text-blue-800' :
                systemData.latest_reading.humidity < 40 ? 'bg-amber-50 text-amber-800' :
                'bg-emerald-50 text-emerald-800']">
                <span>{{ systemData.latest_reading.humidity > 80 ? 'High' : systemData.latest_reading.humidity < 40 ? 'Low' : 'Normal' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Information -->
        <div class="card bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5 col-span-1 md:col-span-2 lg:col-span-1">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 tracking-tight">System Information</h2>
          </div>
          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Device ID</span>
              <span class="text-sm font-medium text-gray-900 font-mono">{{ systemData.device_id }}</span>
            </div>
            <div v-if="systemData.latitude && systemData.longitude" class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Location</span>
              <span class="text-sm font-medium text-gray-900">{{ systemData.latitude.toFixed(4) }}, {{ systemData.longitude.toFixed(4) }}</span>
            </div>
            <div v-if="systemData.farm_size" class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Farm Size</span>
              <span class="text-sm font-medium text-gray-900">{{ systemData.farm_size }} acres</span>
            </div>
            <div v-if="systemData.soil_type" class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">Soil Type</span>
              <span class="text-sm font-medium text-gray-900">{{ systemData.soil_type }}</span>
            </div>
            <div v-if="systemData.installation_date" class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-500">Installation Date</span>
              <span class="text-sm font-medium text-gray-900">{{ new Date(systemData.installation_date).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Delete System</h3>
        <p class="text-gray-600 text-center mb-6">Are you sure you want to delete "{{ systemData?.name }}"? This action cannot be undone.</p>
        <div class="flex gap-3">
          <button 
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  will-change: transform, box-shadow;
}
</style>