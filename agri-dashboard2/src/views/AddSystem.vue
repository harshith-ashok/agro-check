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
      router.push('/')
    } else {
      error.value = 'Failed to create system'
    }
  } catch (err: any) {
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
      <div class="mb-10">
        <button 
          @click="cancel"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          ← Back to Dashboard
        </button>
        <h1 class="text-4xl font-bold text-emerald-600 mb-2">Add New System</h1>
        <p class="text-gray-600 text-lg">Register a new AgriTech monitoring system</p>
      </div>

      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl p-8 shadow-sm border border-black/5 space-y-8">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Device ID *</label>
          <input v-model="formData.deviceId" required class="w-full px-4 py-3 border rounded-xl" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">System Name *</label>
          <input v-model="formData.name" required class="w-full px-4 py-3 border rounded-xl" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Region *</label>
          <select @change="handleRegionChange" class="w-full px-4 py-3 border rounded-xl">
            <option value="">Select region</option>
            <option v-for="r in predefinedRegions" :key="r" :value="r">{{ r }}</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div v-if="showCustomRegion">
          <label class="block text-sm font-medium text-gray-700 mb-2">Custom Region *</label>
          <input v-model="customRegion" class="w-full px-4 py-3 border rounded-xl" />
        </div>

        <div class="grid grid-cols-2 gap-6">
          <input v-model="formData.latitude" placeholder="Latitude" class="px-4 py-3 border rounded-xl" />
          <input v-model="formData.longitude" placeholder="Longitude" class="px-4 py-3 border rounded-xl" />
        </div>

        <div class="grid grid-cols-3 gap-6">
          <input v-model="formData.farmSize" placeholder="Farm Size" class="px-4 py-3 border rounded-xl" />
          <select v-model="formData.cropType" class="px-4 py-3 border rounded-xl">
            <option value="">Crop</option>
            <option v-for="c in cropTypes" :key="c" :value="c">{{ c }}</option>
          </select>
          <select v-model="formData.soilType" class="px-4 py-3 border rounded-xl">
            <option value="">Soil</option>
            <option v-for="s in soilTypes" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <input v-model="formData.installationDate" type="date" class="px-4 py-3 border rounded-xl" />
          <input v-model="formData.notes" placeholder="Notes" class="px-4 py-3 border rounded-xl" />
        </div>

        <div class="flex gap-4">
          <button type="button" @click="cancel" class="flex-1 py-3 bg-gray-200 rounded-xl">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl">
            {{ loading ? 'Adding...' : 'Add System' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
