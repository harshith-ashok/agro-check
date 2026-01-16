<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { systemsAPI } from '../services/api'

const router = useRouter()

const formData = ref({
  deviceId: '',
  name: '',
  region: '',
  latitude: '',
  longitude: '',
  farmSize: '',
  cropType: '',
  soilType: '',
  installationDate: '',
  notes: ''
})

const customRegion = ref('')
const showCustomRegion = ref(false)
const loading = ref(false)
const error = ref('')
const userId = ref<number | null>(null)

const predefinedRegions = [
  'North Region',
  'South Region',
  'East Region',
  'West Region',
  'Central Region'
]

const cropTypes = [
  'Wheat',
  'Rice',
  'Corn',
  'Soybeans',
  'Cotton',
  'Vegetables',
  'Fruits',
  'Other'
]

const soilTypes = [
  'Clay',
  'Sandy',
  'Loam',
  'Silt',
  'Peaty',
  'Chalky'
]

onMounted(() => {
  // Check authentication
  const userIdStr = localStorage.getItem('userId')
  if (!userIdStr) {
    router.push('/login')
    return
  }
  userId.value = parseInt(userIdStr)
})

const handleRegionChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  if (value === 'custom') {
    showCustomRegion.value = true
    formData.value.region = ''
  } else {
    showCustomRegion.value = false
    formData.value.region = value
  }
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    // Use custom region if specified
    const region = showCustomRegion.value && customRegion.value 
      ? customRegion.value 
      : formData.value.region

    const response = await systemsAPI.createSystem({
      userId: userId.value!,
      deviceId: formData.value.deviceId,
      name: formData.value.name,
      region: region,
      latitude: formData.value.latitude ? parseFloat(formData.value.latitude) : undefined,
      longitude: formData.value.longitude ? parseFloat(formData.value.longitude) : undefined,
      farmSize: formData.value.farmSize ? parseFloat(formData.value.farmSize) : undefined,
      cropType: formData.value.cropType || undefined,
      soilType: formData.value.soilType || undefined,
      installationDate: formData.value.installationDate || undefined,
      notes: formData.value.notes || undefined
    })

    if (response.success) {
      // Navigate back to dashboard
      router.push('/')
    } else {
      error.value = response.error || 'Failed to create system'
    }
  } catch (err: any) {
    console.error('Create system error:', err)
    error.value = err.response?.data?.error || 'Failed to create system'
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-10">
        <button 
          @click="cancel"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </button>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-2 tracking-tight">
          Add New System
        </h1>
        <p class="text-gray-600 text-lg">Register a new AgriTech monitoring system</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
        <!-- Device Information -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            Device Information
          </h2>
          
          <div class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Device ID <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="formData.deviceId"
                type="text" 
                required
                placeholder="e.g., NODE_12"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <p class="text-xs text-gray-500 mt-1">The unique identifier for your sensor device</p>
            </div>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            Basic Information
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                System Name <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="formData.name"
                type="text" 
                required
                placeholder="e.g., North Farm Alpha"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Region <span class="text-red-500">*</span>
              </label>
              <select 
                @change="handleRegionChange"
                :value="showCustomRegion ? 'custom' : formData.region"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="">Select a region</option>
                <option v-for="region in predefinedRegions" :key="region" :value="region">
                  {{ region }}
                </option>
                <option value="custom">+ Custom Region</option>
              </select>
            </div>

            <div v-if="showCustomRegion" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Custom Region Name <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="customRegion"
                type="text" 
                required
                placeholder="Enter custom region name"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-600">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            Location
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input 
                v-model="formData.latitude"
                type="number"
                step="any"
                placeholder="e.g., 40.7128"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input 
                v-model="formData.longitude"
                type="number"
                step="any"
                placeholder="e.g., -74.0060"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Farm Details -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            Farm Details
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Farm Size (acres)
              </label>
              <input 
                v-model="formData.farmSize"
                type="number"
                step="any"
                placeholder="e.g., 150"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Crop Type
              </label>
              <select 
                v-model="formData.cropType"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="">Select crop type</option>
                <option v-for="crop in cropTypes" :key="crop" :value="crop">
                  {{ crop }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Soil Type
              </label>
              <select 
                v-model="formData.soilType"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="">Select soil type</option>
                <option v-for="soil in soilTypes" :key="soil" :value="soil">
                  {{ soil }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Installation -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            Installation Details
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Installation Date
              </label>
              <input 
                v-model="formData.installationDate"
                type="date"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <input 
                v-model="formData.notes"
                type="text" 
                placeholder="Optional notes"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4 pt-6 border-t border-gray-100">
          <button 
            type="button"
            @click="cancel"
            :disabled="loading"
            class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            :disabled="loading"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span v-if="!loading">Add System</span>
            <span v-else>Adding...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>