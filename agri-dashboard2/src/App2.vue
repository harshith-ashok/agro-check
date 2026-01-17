<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const soilChartRef = ref<HTMLCanvasElement>()
const cropChartRef = ref<HTMLCanvasElement>()

onMounted(() => {
  // Soil Moisture Donut Chart
  new Chart(soilChartRef.value!, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [65, 35],
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

  // Crop Health Area Chart
  const ctx = cropChartRef.value!.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)')

  new Chart(cropChartRef.value!, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [20, 35, 50, 65, 80, 95],
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

  // GSAP Animations
  gsap.from('.card-animate', { 
    duration: 1, 
    opacity: 0, 
    y: 30, 
    stagger: 0.15, 
    ease: 'power3.out',
    onComplete: () => {
      gsap.set('.card-animate', { clearProps: 'all' })
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
    <div class="mb-10">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-2 tracking-tight">
        AgriTech Analytics
      </h1>
      <p class="text-gray-600 text-lg">Real-time farm monitoring and insights</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Soil Moisture Widget -->
      <div class="card card-animate bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5 col-span-1 md:col-span-2 lg:col-span-1">
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
            <span class="text-5xl font-bold text-gray-900 leading-none">65%</span>
            <span class="text-sm text-gray-500 mt-1 font-medium">Optimal</span>
          </div>
        </div>
        <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
          <span>Skip irrigation - Rain expected</span>
        </div>
      </div>

      <!-- Crop Health Widget -->
      <div class="card card-animate bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5 col-span-1 md:col-span-2 lg:col-span-2">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900 tracking-tight">Crop Health Index</h2>
          <div class="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-lg text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>+18% this month</span>
          </div>
        </div>
        <div class="h-72 mt-4">
          <canvas ref="cropChartRef"></canvas>
        </div>
      </div>

      <!-- System Status Widget -->
      <div class="card bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5">
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
              <p class="text-xl font-bold text-gray-900 leading-tight">92%</p>
              <p class="text-sm text-gray-500 mt-0.5">Battery Level</p>
            </div>
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"></div>
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
              <p class="text-xl font-bold text-gray-900 leading-tight">6.3</p>
              <p class="text-sm text-gray-500 mt-0.5">Soil pH</p>
            </div>
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"></div>
          </div>
          
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-xl font-bold text-gray-900 leading-tight">Active</p>
              <p class="text-sm text-gray-500 mt-0.5">Solar Charging</p>
            </div>
            <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"></div>
          </div>
        </div>
      </div>

      <!-- Environmental Conditions Widget -->
      <div class="card bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:-translate-y-0.5 col-span-1 md:col-span-2 lg:col-span-2">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 tracking-tight">Environmental Conditions</h2>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div class="text-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div class="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sky-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
              </svg>
            </div>
            <p class="text-4xl font-bold text-gray-900 leading-none mb-2">24°C</p>
            <p class="text-sm text-gray-500 font-medium mb-3">Air Temperature</p>
            <div class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              <span>+2°C</span>
            </div>
          </div>
          
          <div class="text-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div class="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sky-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <p class="text-4xl font-bold text-gray-900 leading-none mb-2">68%</p>
            <p class="text-sm text-gray-500 font-medium mb-3">Humidity</p>
            <div class="inline-flex items-center gap-1 bg-red-50 text-red-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span>-5%</span>
            </div>
          </div>
          
          <div class="text-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div class="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sky-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="text-4xl font-bold text-gray-900 leading-none mb-2">Low</p>
            <p class="text-sm text-gray-500 font-medium mb-3">Disease Risk</p>
            <div class="inline-flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Stable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.card,
.card-animate {
  will-change: transform, box-shadow;
}
</style>