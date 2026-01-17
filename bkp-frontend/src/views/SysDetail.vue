<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <button
            @click="$router.push('/')"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent tracking-tight">
            {{ system?.name }}
          </h1>
          <p class="text-gray-600 mt-2">{{ system?.device_id }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            :class="[
              'px-4 py-2 rounded-xl font-medium text-sm',
              statusClass
            ]"
          >
            {{ statusText }}
          </span>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl p-6 border border-black/5 animate-pulse h-64"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        <div class="widget-card md:col-span-2 bg-white rounded-[var(--radius-xl2)] p-8 border border-black/5 shadow-lg">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Soil Moisture</h2>
            <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
              Next: Skip (Rain Expected)
            </span>
          </div>
          <div class="flex items-center justify-center" style="height: 280px;">
            <canvas ref="moistureChart"></canvas>
          </div>
        </div>

        <div class="widget-card bg-white rounded-[var(--radius-xl2)] p-6 border border-black/5 shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
          <div class="space-y-4">
            <div class="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Battery</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div class="text-3xl font-bold text-emerald-600">{{ latestData?.battery }}%</div>
            </div>

            <div class="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Soil pH</span>
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div class="text-3xl font-bold text-blue-600">{{ latestData?.soil_ph }}</div>
            </div>

            <div class="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Solar Charging</span>
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div class="text-3xl font-bold text-amber-600">{{ latestData?.solar_voltage }}V</div>
            </div>
          </div>
        </div>

        <div class="widget-card md:col-span-2 bg-white rounded-[var(--radius-xl2)] p-8 border border-black/5 shadow-lg">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Crop Health Index</h2>
          <div style="height: 280px;">
            <canvas ref="healthChart"></canvas>
          </div>
        </div>

        <div class="widget-card bg-white rounded-[var(--radius-xl2)] p-6 border border-black/5 shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Environmental</h3>
          <div class="space-y-4">
            <div class="bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl p-4">
              <div class="text-sm text-gray-600 mb-2">Air Temperature</div>
              <div class="text-3xl font-bold text-red-600">{{ latestData?.air_temp }}°C</div>
              <div class="flex items-center gap-1 mt-2 text-sm text-red-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
                <span>+2.3°C</span>
              </div>
            </div>

            <div class="bg-gradient-to-r from-cyan-50 to-cyan-100/50 rounded-xl p-4">
              <div class="text-sm text-gray-600 mb-2">Humidity</div>
              <div class="text-3xl font-bold text-cyan-600">{{ latestData?.humidity }}%</div>
            </div>

            <div class="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4">
              <div class="text-sm text-gray-600 mb-2">Disease Risk</div>
              <div class="text-3xl font-bold text-purple-600">Low</div>
            </div>
          </div>
        </div>

        <div class="widget-card md:col-span-3 bg-white rounded-[var(--radius-xl2)] p-8 border border-black/5 shadow-lg">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Historical Data</h2>
          <div style="height: 320px;">
            <canvas ref="historyChart"></canvas>
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

const moistureChart = ref(null);
const healthChart = ref(null);
const historyChart = ref(null);

let charts = [];
let refreshInterval = null;

const statusClass = computed(() => {
  if (!latestData.value) return 'bg-gray-100 text-gray-600';
  const now = new Date();
  const lastUpdate = new Date(latestData.value.created_at);
  const diffMinutes = (now - lastUpdate) / 1000 / 60;
  
  if (diffMinutes < 20) return 'bg-emerald-100 text-emerald-700';
  if (diffMinutes < 60) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
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
  const data = historicalData.value.slice().reverse();
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      datasets: [
        {
          label: 'Soil Moisture (%)',
          data: data.map(d => d.soil_moisture),
          borderColor: '#2D5A27',
          backgroundColor: 'rgba(45, 90, 39, 0.1)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Temperature (°C)',
          data: data.map(d => d.air_temp),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          yAxisID: 'y1',
          tension: 0.4
        },
        {
          label: 'Humidity (%)',
          data: data.map(d => d.humidity),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y',
          tension: 0.4
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
          position: 'top'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: '#f3f4f6' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false }
        },
        x: {
          grid: { display: false }
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
