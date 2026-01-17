<template>
  <div class="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <button
          @click="$router.push('/')"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="font-medium">Back to Dashboard</span>
        </button>
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
              {{ system?.name }}
            </h1>
            <p class="text-gray-600 mt-2">{{ system?.device_id }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              :class="[
                'px-4 py-2 rounded-xl font-medium text-sm border-2',
                statusClass
              ]"
            >
              {{ statusText }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse h-64"></div>
      </div>

      <div v-else>
        <!-- Critical Alerts -->
        <div v-if="criticalAlerts.length > 0" class="mb-6 space-y-3">
          <div v-for="(alert, idx) in criticalAlerts" :key="idx"
               :class="['rounded-xl p-5 flex items-start gap-4 border-2', alert.bgClass]">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
              <svg class="w-6 h-6" :class="alert.iconClass" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="flex-1">
              <div :class="['font-semibold mb-1', alert.textClass]">{{ alert.title }}</div>
              <div :class="['text-sm', alert.textClass]">{{ alert.message }}</div>
            </div>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- Soil Moisture - Large Card -->
          <div class="widget-card lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Soil Moisture</h2>
                <p class="text-sm text-gray-500 mt-1">Current hydration level</p>
              </div>
              <span :class="['px-4 py-2 rounded-xl text-sm font-semibold border-2', getMoistureStatusBadge(latestData?.soil_moisture)]">
                {{ getMoistureActionText(latestData?.soil_moisture) }}
              </span>
            </div>
            <div class="flex items-center justify-center" style="height: 280px;">
              <canvas ref="moistureChart"></canvas>
            </div>
            <div v-if="getMoistureRecommendation(latestData?.soil_moisture)" 
                 class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p class="text-sm font-medium text-blue-900">{{ getMoistureRecommendation(latestData?.soil_moisture) }}</p>
            </div>
          </div>

          <!-- System Status Cards -->
          <div class="widget-card bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 class="text-lg font-bold text-gray-900 mb-6">System Status</h3>
            <div class="space-y-4">
              <div :class="['rounded-xl p-4 border-2', getBatteryCardClass(latestData?.battery)]">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Battery Level</span>
                  <div class="flex items-center gap-2">
                    <span :class="['w-2 h-2 rounded-full', getBatteryDotClass(latestData?.battery)]"></span>
                    <span class="text-xs font-semibold text-gray-600">{{ getBatteryLabel(latestData?.battery) }}</span>
                  </div>
                </div>
                <div :class="['text-3xl font-bold', getBatteryTextClass(latestData?.battery)]">
                  {{ latestData?.battery }}%
                </div>
                <div v-if="latestData?.battery < 40" class="mt-3 text-xs font-medium text-gray-600 pt-3 border-t border-gray-200">
                  {{ latestData?.battery < 20 ? 'Check solar panel immediately' : 'Monitor charging rate' }}
                </div>
              </div>

              <div :class="['rounded-xl p-4 border-2', getPhCardClass(latestData?.soil_ph)]">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Soil pH</span>
                  <div class="flex items-center gap-2">
                    <span :class="['w-2 h-2 rounded-full', getPhDotClass(latestData?.soil_ph)]"></span>
                    <span class="text-xs font-semibold text-gray-600">{{ getPhLabel(latestData?.soil_ph) }}</span>
                  </div>
                </div>
                <div :class="['text-3xl font-bold', getPhTextClass(latestData?.soil_ph)]">
                  {{ latestData?.soil_ph }}
                </div>
                <div v-if="latestData?.soil_ph < 6.0 || latestData?.soil_ph > 7.0" class="mt-3 text-xs font-medium text-gray-600 pt-3 border-t border-gray-200">
                  {{ getPhRecommendation(latestData?.soil_ph) }}
                </div>
              </div>

              <div class="rounded-xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Solar Charging</span>
                  <span :class="['w-2 h-2 rounded-full', latestData?.solar_voltage > 4 ? 'bg-emerald-500' : 'bg-amber-500']"></span>
                </div>
                <div class="text-3xl font-bold text-amber-700">{{ latestData?.solar_voltage }}V</div>
                <div class="mt-3 text-xs font-medium text-gray-600 pt-3 border-t border-amber-200">
                  {{ latestData?.solar_voltage > 5 ? 'Optimal charging' : 'Low voltage detected' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Second Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- Crop Health Chart -->
          <div class="widget-card lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900">Crop Health Index</h2>
              <p class="text-sm text-gray-500 mt-1">Composite health score based on all metrics</p>
            </div>
            <div style="height: 280px;">
              <canvas ref="healthChart"></canvas>
            </div>
          </div>

          <!-- Environmental Conditions -->
          <div class="widget-card bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 class="text-lg font-bold text-gray-900 mb-6">Environmental</h3>
            <div class="space-y-4">
              <div :class="['rounded-xl p-4 border-2', getTempCardClass(latestData?.air_temp)]">
                <div class="text-sm font-medium text-gray-700 mb-2">Air Temperature</div>
                <div :class="['text-3xl font-bold', getTempTextClass(latestData?.air_temp)]">
                  {{ latestData?.air_temp }}°C
                </div>
                <div class="flex items-center gap-1 mt-3 text-sm font-medium pt-3 border-t border-gray-200" :class="getTempChangeClass(latestData?.air_temp)">
                  <span>{{ getTempStatus(latestData?.air_temp) }}</span>
                </div>
              </div>

              <div :class="['rounded-xl p-4 border-2', getHumidityCardClass(latestData?.humidity)]">
                <div class="text-sm font-medium text-gray-700 mb-2">Humidity</div>
                <div :class="['text-3xl font-bold', getHumidityTextClass(latestData?.humidity)]">
                  {{ latestData?.humidity }}%
                </div>
                <div v-if="latestData?.humidity > 85" class="mt-3 text-xs font-medium text-gray-600 pt-3 border-t border-gray-200">
                  High humidity - monitor for fungal issues
                </div>
              </div>

              <div :class="['rounded-xl p-4 border-2', getDiseaseRiskCardClass(latestData)]">
                <div class="text-sm font-medium text-gray-700 mb-2">Disease Risk</div>
                <div :class="['text-3xl font-bold', getDiseaseRiskTextClass(latestData)]">
                  {{ getDiseaseRiskLevel(latestData) }}
                </div>
                <div class="mt-3 text-xs font-medium text-gray-600 pt-3 border-t border-gray-200">
                  {{ getDiseaseRiskMessage(latestData) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Historical Data - Full Width with Chart and Table -->
        <div class="widget-card bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Historical Trends</h2>
              <p class="text-sm text-gray-500 mt-1">Last 24 hours of sensor readings</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="viewMode = 'chart'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  viewMode === 'chart' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                Chart View
              </button>
              <button
                @click="viewMode = 'table'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  viewMode === 'table' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                Table View
              </button>
            </div>
          </div>

          <!-- Chart View -->
          <div v-show="viewMode === 'chart'" style="height: 400px;">
            <canvas ref="historyChart"></canvas>
          </div>

          <!-- Table View -->
          <div v-show="viewMode === 'table'" class="overflow-auto" style="max-height: 600px;">
            <div class="mb-4 flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search table..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                @click="searchQuery = ''"
                class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
            
            <table class="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead class="bg-gradient-to-r from-indigo-50 to-indigo-100 sticky top-0">
                <tr>
                  <th 
                    @click="sortTable('created_at')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-indigo-200 transition-colors"
                  >
                    <div class="flex items-center gap-2">
                      Timestamp
                      <svg v-if="sortField === 'created_at'" class="w-4 h-4" :class="sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </th>
                  <th 
                    @click="sortTable('soil_moisture')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-indigo-200 transition-colors"
                  >
                    <div class="flex items-center gap-2">
                      Moisture (%)
                      <svg v-if="sortField === 'soil_moisture'" class="w-4 h-4" :class="sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </th>
                  <th 
                    @click="sortTable('soil_ph')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-indigo-200 transition-colors"
                  >
                    <div class="flex items-center gap-2">
                      pH
                      <svg v-if="sortField === 'soil_ph'" class="w-4 h-4" :class="sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </th>
                  <th 
                    @click="sortTable('air_temp')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-indigo-200 transition-colors"
                  >
                    <div class="flex items-center gap-2">
                      Temp (°C)
                      <svg v-if="sortField === 'air_temp'" class="w-4 h-4" :class="sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </th>
                  <th 
                    @click="sortTable('humidity')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-indigo-200 transition-colors"
                  >
                    <div class="flex items-center gap-2">
                      Humidity (%)
                      <svg v-if="sortField === 'humidity'" class="w-4 h-4" :class="sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </th>
                  <th 
                    @click="sortTable('battery')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-indigo-200 transition-colors"
                  >
                    <div class="flex items-center gap-2">
                      Battery (%)
                      <svg v-if="sortField === 'battery'" class="w-4 h-4" :class="sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </th>
                  <th 
                    @click="sortTable('solar_voltage')"
                    class="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-indigo-200 transition-colors"
                  >
                    <div class="flex items-center gap-2">
                      Solar (V)
                      <svg v-if="sortField === 'solar_voltage'" class="w-4 h-4" :class="sortOrder === 'asc' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(row, idx) in filteredAndSortedData" 
                  :key="idx"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ new Date(row.created_at).toLocaleString() }}
                  </td>
                  <td 
                    class="px-4 py-3 text-sm font-medium"
                    :class="getMoistureClass(row.soil_moisture)"
                  >
                    {{ row.soil_moisture }}
                  </td>
                  <td 
                    class="px-4 py-3 text-sm font-medium"
                    :class="getPhClass(row.soil_ph)"
                  >
                    {{ row.soil_ph }}
                  </td>
                  <td 
                    class="px-4 py-3 text-sm font-medium"
                    :class="getTempClass(row.air_temp)"
                  >
                    {{ row.air_temp }}
                  </td>
                  <td 
                    class="px-4 py-3 text-sm font-medium"
                    :class="getHumidityClass(row.humidity)"
                  >
                    {{ row.humidity }}
                  </td>
                  <td 
                    class="px-4 py-3 text-sm font-medium"
                    :class="getBatteryClass(row.battery)"
                  >
                    {{ row.battery }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ row.solar_voltage }}
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="filteredAndSortedData.length === 0" class="text-center py-8 text-gray-500">
              No data found
            </div>
            
            <div v-if="filteredAndSortedData.length > 0" class="mt-4 text-sm text-gray-600 text-center">
              Showing {{ filteredAndSortedData.length }} of {{ historicalData.length }} records
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { systemService } from '../services/api';
import { Chart, registerables } from 'chart.js';
import gsap from 'gsap';

Chart.register(...registerables);

const route = useRoute();
const system = ref(null);
const latestData = ref(null);
const historicalData = ref([]);
const loading = ref(true);
const viewMode = ref('chart');
const searchQuery = ref('');
const sortField = ref('created_at');
const sortOrder = ref('desc');

const moistureChart = ref(null);
const healthChart = ref(null);
const historyChart = ref(null);

let charts = [];
let refreshInterval = null;

// Table sorting and filtering
const sortTable = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'desc';
  }
};

const filteredAndSortedData = computed(() => {
  let data = [...historicalData.value];
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(query)
      );
    });
  }
  
  // Sort
  data.sort((a, b) => {
    let aVal = a[sortField.value];
    let bVal = b[sortField.value];
    
    if (sortField.value === 'created_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
  
  return data;
});

// Table cell color classes
const getMoistureClass = (value) => {
  if (value < 30) return 'text-red-700 bg-red-50';
  if (value < 45) return 'text-amber-700 bg-amber-50';
  return 'text-emerald-700 bg-emerald-50';
};

const getPhClass = (value) => {
  if (value < 5.5 || value > 7.5) return 'text-red-700 bg-red-50';
  if (value < 6.0 || value > 7.0) return 'text-amber-700 bg-amber-50';
  return 'text-blue-700 bg-blue-50';
};

const getTempClass = (value) => {
  if (value > 40 || value < 10) return 'text-red-700 bg-red-50';
  if (value > 35 || value < 15) return 'text-amber-700 bg-amber-50';
  return 'text-emerald-700 bg-emerald-50';
};

const getHumidityClass = (value) => {
  if (value > 85 || value < 40) return 'text-amber-700 bg-amber-50';
  return 'text-cyan-700 bg-cyan-50';
};

const getBatteryClass = (value) => {
  if (value < 20) return 'text-red-700 bg-red-50';
  if (value < 40) return 'text-amber-700 bg-amber-50';
  return 'text-emerald-700 bg-emerald-50';
};

const statusClass = computed(() => {
  if (!latestData.value) return 'bg-gray-50 text-gray-600 border-gray-300';
  const now = new Date();
  const lastUpdate = new Date(latestData.value.created_at);
  const diffMinutes = (now - lastUpdate) / 1000 / 60;
  
  if (diffMinutes < 20) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
  if (diffMinutes < 60) return 'bg-amber-50 text-amber-700 border-amber-300';
  return 'bg-red-50 text-red-700 border-red-300';
});

const statusText = computed(() => {
  if (!latestData.value) return 'Offline';
  const now = new Date();
  const lastUpdate = new Date(latestData.value.created_at);
  const diffMinutes = (now - lastUpdate) / 1000 / 60;
  
  if (diffMinutes < 20) return 'Online';
  if (diffMinutes < 60) return 'Warning';
  return 'Offline';
});

const criticalAlerts = computed(() => {
  if (!latestData.value) return [];
  const alerts = [];
  
  if (latestData.value.soil_moisture < 30) {
    alerts.push({
      title: 'Critical Soil Moisture',
      message: 'Soil moisture is critically low. Start irrigation immediately to prevent crop stress.',
      bgClass: 'bg-red-50 border-red-300',
      textClass: 'text-red-800',
      iconClass: 'text-red-600'
    });
  }
  
  if (latestData.value.battery < 20) {
    alerts.push({
      title: 'Critical Battery Level',
      message: 'Battery is below 20%. Check solar panel connection and clean panels if necessary.',
      bgClass: 'bg-red-50 border-red-300',
      textClass: 'text-red-800',
      iconClass: 'text-red-600'
    });
  }
  
  if (latestData.value.soil_ph < 5.5 || latestData.value.soil_ph > 7.5) {
    alerts.push({
      title: 'Soil pH Out of Range',
      message: `pH is ${latestData.value.soil_ph}. ${latestData.value.soil_ph < 5.5 ? 'Apply lime to increase pH' : 'Apply sulfur to decrease pH'}.`,
      bgClass: 'bg-amber-50 border-amber-300',
      textClass: 'text-amber-800',
      iconClass: 'text-amber-600'
    });
  }
  
  if (latestData.value.air_temp > 40 || latestData.value.air_temp < 10) {
    alerts.push({
      title: 'Extreme Temperature',
      message: `Temperature is ${latestData.value.air_temp}°C. ${latestData.value.air_temp > 40 ? 'Provide shade and increase watering' : 'Protect crops from frost damage'}.`,
      bgClass: 'bg-red-50 border-red-300',
      textClass: 'text-red-800',
      iconClass: 'text-red-600'
    });
  }
  
  if (latestData.value.humidity > 85 && latestData.value.air_temp > 25) {
    alerts.push({
      title: 'High Disease Risk',
      message: 'High humidity and temperature combination increases fungal disease risk. Monitor crops closely.',
      bgClass: 'bg-amber-50 border-amber-300',
      textClass: 'text-amber-800',
      iconClass: 'text-amber-600'
    });
  }
  
  return alerts;
});

// Helper functions for status indicators
const getBatteryCardClass = (battery) => {
  if (battery < 20) return 'bg-gradient-to-r from-red-50 to-red-100/50';
  if (battery < 40) return 'bg-gradient-to-r from-amber-50 to-amber-100/50';
  return 'bg-gradient-to-r from-emerald-50 to-emerald-100/50';
};

const getBatteryTextClass = (battery) => {
  if (battery < 20) return 'text-red-600';
  if (battery < 40) return 'text-amber-600';
  return 'text-emerald-600';
};

const getBatteryDotClass = (battery) => {
  if (battery < 20) return 'bg-red-500';
  if (battery < 40) return 'bg-amber-500';
  return 'bg-emerald-500';
};

const getBatteryLabel = (battery) => {
  if (battery < 20) return 'Critical';
  if (battery < 40) return 'Low';
  return 'Good';
};

const getPhCardClass = (ph) => {
  if (ph < 5.5 || ph > 7.5) return 'bg-gradient-to-r from-red-50 to-red-100/50';
  if (ph < 6.0 || ph > 7.0) return 'bg-gradient-to-r from-amber-50 to-amber-100/50';
  return 'bg-gradient-to-r from-blue-50 to-blue-100/50';
};

const getPhTextClass = (ph) => {
  if (ph < 5.5 || ph > 7.5) return 'text-red-600';
  if (ph < 6.0 || ph > 7.0) return 'text-amber-600';
  return 'text-blue-600';
};

const getPhDotClass = (ph) => {
  if (ph < 5.5 || ph > 7.5) return 'bg-red-500';
  if (ph < 6.0 || ph > 7.0) return 'bg-amber-500';
  return 'bg-blue-500';
};

const getPhLabel = (ph) => {
  if (ph < 5.5 || ph > 7.5) return 'Critical';
  if (ph < 6.0 || ph > 7.0) return 'Warning';
  return 'Optimal';
};

const getPhRecommendation = (ph) => {
  if (ph < 5.5) return 'Apply lime to increase pH';
  if (ph > 7.5) return 'Apply sulfur to decrease pH';
  if (ph < 6.0) return 'Consider lime application';
  if (ph > 7.0) return 'Monitor pH levels';
  return '';
};

const getTempCardClass = (temp) => {
  if (temp > 40 || temp < 10) return 'bg-gradient-to-r from-red-50 to-red-100/50';
  if (temp > 35 || temp < 15) return 'bg-gradient-to-r from-amber-50 to-amber-100/50';
  return 'bg-gradient-to-r from-emerald-50 to-emerald-100/50';
};

const getTempTextClass = (temp) => {
  if (temp > 40 || temp < 10) return 'text-red-600';
  if (temp > 35 || temp < 15) return 'text-amber-600';
  return 'text-emerald-600';
};

const getTempChangeClass = (temp) => {
  if (temp > 35) return 'text-red-600';
  if (temp > 30) return 'text-amber-600';
  return 'text-emerald-600';
};

const getTempStatus = (temp) => {
  if (temp > 40) return 'Extreme heat';
  if (temp > 35) return 'High temperature';
  if (temp < 10) return 'Cold weather';
  if (temp < 15) return 'Cool';
  return 'Optimal';
};

const getHumidityCardClass = (humidity) => {
  if (humidity > 85) return 'bg-gradient-to-r from-amber-50 to-amber-100/50';
  if (humidity < 40) return 'bg-gradient-to-r from-amber-50 to-amber-100/50';
  return 'bg-gradient-to-r from-cyan-50 to-cyan-100/50';
};

const getHumidityTextClass = (humidity) => {
  if (humidity > 85 || humidity < 40) return 'text-amber-600';
  return 'text-cyan-600';
};

const getDiseaseRiskLevel = (data) => {
  if (!data) return 'Unknown';
  if (data.humidity > 85 && data.air_temp > 25) return 'High';
  if (data.humidity > 75 && data.air_temp > 20) return 'Medium';
  return 'Low';
};

const getDiseaseRiskCardClass = (data) => {
  const level = getDiseaseRiskLevel(data);
  if (level === 'High') return 'bg-gradient-to-r from-red-50 to-red-100/50';
  if (level === 'Medium') return 'bg-gradient-to-r from-amber-50 to-amber-100/50';
  return 'bg-gradient-to-r from-emerald-50 to-emerald-100/50';
};

const getDiseaseRiskTextClass = (data) => {
  const level = getDiseaseRiskLevel(data);
  if (level === 'High') return 'text-red-600';
  if (level === 'Medium') return 'text-amber-600';
  return 'text-emerald-600';
};

const getDiseaseRiskMessage = (data) => {
  const level = getDiseaseRiskLevel(data);
  if (level === 'High') return 'Monitor closely for fungal diseases';
  if (level === 'Medium') return 'Regular monitoring recommended';
  return 'Conditions favorable for healthy crops';
};

const getMoistureStatusBadge = (moisture) => {
  if (moisture < 30) return 'bg-red-50 text-red-700 border-red-300';
  if (moisture < 45) return 'bg-amber-50 text-amber-700 border-amber-300';
  if (moisture > 80) return 'bg-blue-50 text-blue-700 border-blue-300';
  return 'bg-emerald-50 text-emerald-700 border-emerald-300';
};

const getMoistureActionText = (moisture) => {
  if (moisture < 30) return 'Irrigate Now';
  if (moisture < 45) return 'Schedule Irrigation';
  if (moisture > 80) return 'Reduce Watering';
  return 'Optimal';
};

const getMoistureRecommendation = (moisture) => {
  if (moisture < 30) return 'Critical moisture level. Start irrigation immediately to prevent crop damage.';
  if (moisture < 45) return 'Soil moisture is getting low. Schedule irrigation within the next 24 hours.';
  if (moisture > 80) return 'Soil is very wet. Reduce watering frequency to prevent root rot.';
  if (moisture > 70) return 'Moisture levels are good. Next irrigation not needed immediately.';
  return null;
};

const fetchSystemData = async () => {
  try {
    const systemData = await systemService.getById(route.params.id);
    system.value = systemData;
    
    const history = await systemService.getHistory(route.params.id, 24);
    historicalData.value = history;
    
    if (history.length > 0) {
      latestData.value = history[0];
    }
  } catch (error) {
    console.error('Failed to fetch system data:', error);
  } finally {
    loading.value = false;
  }
};

const createMoistureChart = () => {
  if (!moistureChart.value || !latestData.value) return;
  
  const ctx = moistureChart.value.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [latestData.value.soil_moisture, 100 - latestData.value.soil_moisture],
        backgroundColor: ['#2D5A27', '#e5e7eb'],
        borderWidth: 0,
        cutout: '75%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    },
    plugins: [{
      id: 'centerText',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();
        ctx.font = 'bold 48px Inter';
        ctx.fillStyle = '#2D5A27';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${latestData.value.soil_moisture}%`, width / 2, height / 2);
        ctx.restore();
      }
    }]
  });
  
  charts.push(chart);
};

const createHealthChart = () => {
  if (!healthChart.value || historicalData.value.length === 0) return;
  
  const ctx = healthChart.value.getContext('2d');
  const data = historicalData.value.slice().reverse();
  
  const healthIndex = data.map(d => {
    const moisture = d.soil_moisture / 100;
    const ph = 1 - Math.abs(d.soil_ph - 6.5) / 3.5;
    const temp = 1 - Math.abs(d.air_temp - 25) / 20;
    return ((moisture + ph + temp) / 3 * 100).toFixed(1);
  });
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      datasets: [{
        label: 'Health Index',
        data: healthIndex,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: '#f3f4f6' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
  
  charts.push(chart);
};

const createHistoryChart = () => {
  if (!historyChart.value || historicalData.value.length === 0) return;
  
  const ctx = historyChart.value.getContext('2d');
  const data = historicalData.value.slice().reverse().slice(0, 24); // Last 24 readings
  
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      datasets: [
        {
          label: 'Soil Moisture (%)',
          data: data.map(d => d.soil_moisture),
          backgroundColor: 'rgba(45, 90, 39, 0.7)',
          borderColor: '#2D5A27',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Temperature (°C)',
          data: data.map(d => d.air_temp),
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          borderColor: '#f59e0b',
          borderWidth: 1,
          yAxisID: 'y1'
        },
        {
          label: 'Humidity (%)',
          data: data.map(d => d.humidity),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 15,
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Moisture & Humidity (%)',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: '#f3f4f6'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Temperature (°C)',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
  
  charts.push(chart);
};

const initCharts = () => {
  charts.forEach(chart => chart.destroy());
  charts = [];
  
  createMoistureChart();
  createHealthChart();
  createHistoryChart();
};

onMounted(async () => {
  await fetchSystemData();
  initCharts();
  
  gsap.from('.widget-card', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out'
  });
  
  refreshInterval = setInterval(fetchSystemData, 60000);
});

onUnmounted(() => {
  charts.forEach(chart => chart.destroy());
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>