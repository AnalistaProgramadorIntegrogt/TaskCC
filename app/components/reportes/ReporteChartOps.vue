<template>
  <div class="chart-card" :class="tema === 'light' ? 'light-mode' : 'dark-mode'">
    <!-- Leyenda personalizada -->
    <div class="leg">
      <span><span class="ld" style="background: rgba(96, 165, 250, 0.7)"></span>Tareas asignadas</span>
      <span><span class="ld" style="background: #fbbf24"></span>Tareas realizadas</span>
      <span><span class="ld" style="background: #34d399"></span>Evidencias fotográficas</span>
    </div>

    <!-- Contenedor del Canvas -->
    <div v-if="!datos || !datos.labels || datos.labels.length === 0" class="empty-chart-box">
      <p class="text-xs text-[#888]">No hay datos de colaboradores para graficar en este período.</p>
    </div>
    <div v-else class="canvas-wrapper">
      <canvas ref="canvasRef" role="img" aria-label="Avance por colaborador"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export interface ChartColaboradorData {
  labels: string[]
  tareasAsignadas: number[]
  tareasRealizadas: number[]
  evidencias?: number[]
  jardineriaAsignada?: number[]
  jardineriaRealizada?: number[]
}

const props = withDefaults(
  defineProps<{
    datos?: ChartColaboradorData
    tema?: 'dark' | 'light'
  }>(),
  {
    datos: () => ({
      labels: [],
      tareasAsignadas: [],
      tareasRealizadas: [],
      evidencias: []
    }),
    tema: 'dark'
  }
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function crearOActualizarGrafico() {
  if (!canvasRef.value) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!props.datos || !props.datos.labels || props.datos.labels.length === 0) {
    return
  }

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const esModoClaro = props.tema === 'light'
  const gridColor = esModoClaro ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.03)'
  const tickColor = esModoClaro ? '#747376' : '#aaa'

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.datos.labels,
      datasets: [
        {
          label: 'Tareas asignadas',
          data: props.datos.tareasAsignadas,
          backgroundColor: esModoClaro ? 'rgba(37, 99, 235, 0.35)' : 'rgba(96, 165, 250, 0.35)',
          borderRadius: 4,
          borderSkipped: false
        },
        {
          label: 'Tareas realizadas',
          data: props.datos.tareasRealizadas,
          backgroundColor: '#fbbf24',
          borderRadius: 4,
          borderSkipped: false
        },
        {
          label: 'Evidencias fotográficas',
          data: props.datos.evidencias || props.datos.jardineriaRealizada || [],
          backgroundColor: '#34d399',
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#161616',
          titleColor: '#fff',
          bodyColor: '#e0e0e0',
          borderColor: esModoClaro ? '#E1E2E4' : '#333',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: tickColor, font: { size: 12, family: 'Montserrat, -apple-system, sans-serif' } }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: tickColor, font: { size: 11, family: 'Montserrat, -apple-system, sans-serif' } }
        }
      }
    }
  })
}

onMounted(() => {
  nextTick(() => {
    crearOActualizarGrafico()
  })
})

watch(
  [() => props.datos, () => props.tema],
  () => {
    nextTick(() => {
      crearOActualizarGrafico()
    })
  },
  { deep: true }
)

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-card {
  border-radius: 18px;
  padding: 1.1rem 1.3rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.chart-card.dark-mode {
  background: #161616;
  border: 0.5px solid #222;
}
.chart-card.light-mode {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.leg {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 12px;
  font-size: 10px;
  font-weight: 600;
}
.dark-mode .leg {
  color: #aaa;
}
.light-mode .leg {
  color: #747376;
}

.ld {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
  margin-right: 5px;
  vertical-align: middle;
}
.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 185px;
}
.empty-chart-box {
  padding: 2.5rem 1rem;
  text-align: center;
}
</style>
