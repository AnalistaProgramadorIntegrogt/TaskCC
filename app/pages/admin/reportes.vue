<template>
  <div 
    class="reportes-admin-container"
    :class="temaActivo === 'light' ? 'theme-light' : 'theme-dark'"
  >
    <!-- Barra Superior de Herramientas y Filtros (No visible al imprimir) -->
    <div class="toolbar-card print:hidden">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Título e Identificador de Sección -->
        <div class="flex items-center gap-3">
          <div class="toolbar-icon">
            <BarChart3 :size="20" />
          </div>
          <div>
            <h1 class="toolbar-title flex items-center gap-2">
              <span>Reportería de Operaciones</span>
              <span class="toolbar-badge">OPS</span>
            </h1>
            <p class="toolbar-subtitle">
              Datos 100% reales del sistema de mantenimiento, checklists e incidencias.
            </p>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- BOTÓN DE CAMBIO DE TEMA: OSCURO OPS / ÍNTEGRO CLARO -->
          <button 
            class="btn-ops btn-ops-theme"
            @click="toggleTema"
            :title="temaActivo === 'dark' ? 'Cambiar a Tema Íntegro (Claro)' : 'Cambiar a Tema Oscuro (OPS)'"
          >
            <Moon v-if="temaActivo === 'dark'" :size="14" class="text-amber-400" />
            <Sun v-else :size="14" class="text-amber-600" />
            <span class="font-bold">
              {{ temaActivo === 'dark' ? 'Tema Oscuro (OPS)' : 'Tema Íntegro (Claro)' }}
            </span>
          </button>

          <button 
            class="btn-ops btn-ops-ghost"
            :disabled="cargando"
            @click="ejecutarConsulta"
            title="Actualizar datos del sistema"
          >
            <RefreshCw :size="13" :class="{'animate-spin': cargando}" />
            <span>Actualizar</span>
          </button>

          <button 
            class="btn-ops btn-ops-ghost"
            @click="imprimirReporte"
            title="Imprimir o guardar como PDF"
          >
            <Printer :size="13" />
            <span>Imprimir / PDF</span>
          </button>

          <button 
            class="btn-ops btn-ops-primary"
            :disabled="cargando || totalTareas === 0"
            @click="exportarReporteCSV"
            title="Descargar datos en CSV"
          >
            <Download :size="13" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <!-- Filtros Rápidos y Selectores -->
      <div class="mt-4 pt-3 toolbar-filters grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- 1. Proyecto -->
        <div class="form-group">
          <label class="ops-label">Proyecto</label>
          <select 
            v-model="filtros.proyectoId" 
            class="ops-select"
            @change="onCambioProyecto"
          >
            <option value="todos">Todos los proyectos</option>
            <option v-for="p in proyectos" :key="p.id" :value="p.id">
              {{ p.nombre }}
            </option>
          </select>
        </div>

        <!-- 2. Rango de Período Rápido -->
        <div class="form-group">
          <label class="ops-label">Período</label>
          <div class="flex gap-1 overflow-x-auto">
            <button 
              v-for="r in rangosRapidos" 
              :key="r.id"
              class="ops-btn-chip"
              :class="rangoRapidoActivo === r.id ? 'active' : ''"
              @click="seleccionarRangoRapido(r.id)"
            >
              {{ r.label }}
            </button>
          </div>
        </div>

        <!-- 3. Fechas Desde / Hasta -->
        <div class="form-group lg:col-span-2">
          <label class="ops-label">Rango Personalizado (Desde → Hasta)</label>
          <div class="grid grid-cols-2 gap-2">
            <input 
              type="date" 
              v-model="filtros.fechaInicio" 
              class="ops-input text-center"
              @change="onCambioFechaManual"
            />
            <input 
              type="date" 
              v-model="filtros.fechaFin" 
              class="ops-input text-center"
              @change="onCambioFechaManual"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de Carga -->
    <div v-if="cargando" class="loading-state">
      <span class="loading-ring"></span>
      <p class="text-xs font-bold text-[#aaa] mt-3">Consultando datos reales del sistema...</p>
    </div>

    <!-- DASHBOARD EJECUTIVO DE OPERACIONES (100% REAL) -->
    <div v-else class="page space-y-4">
      <!-- 1. Encabezado con Logos y Títulos -->
      <ReporteHeaderOps 
        :titulo="headerTitulo"
        :subtitulo="'Mantenimiento & Operaciones'"
        :eyebrow="headerEyebrow"
        :badge-actualizacion="headerBadge"
        :logo-izquierdo-url="'/img/logos/BLANCO 500px.png'"
        :logo-derecho-url="logoDerechoProyecto"
        :nombre-proyecto-corto="nombreProyectoSeleccionado"
        :tema="temaActivo"
      />

      <!-- 2. Cinta de 5 Badges / Medidores Principales Reales -->
      <ReporteBadgesOps 
        :total-asignadas="totalTareas"
        :total-realizadas="tareasCompletadas"
        :porcentaje-avance="porcentajeCumplimiento"
        :sub-avance="totalTareas > 0 ? `${tareasCompletadas} de ${totalTareas} realizadas` : ''"
        :total-fallas="totalFallas"
        :sub-fallas="subFallas"
        :total-evidencias="totalFotosEvidencia"
        :sub-evidencias="tareasCompletadas > 0 ? `${Math.round((totalFotosEvidencia / tareasCompletadas) * 100)}% con foto` : ''"
        :tema="temaActivo"
      />

      <!-- 3. Tarjetas de Colaboradores Reales del Sistema -->
      <ReporteColaboradoresOps 
        :colaboradores="resumenPorColaborador"
        :tema="temaActivo"
      />

      <!-- 4. Gráfico de Barras: Avance por Colaborador -->
      <div v-if="resumenPorColaborador.length > 0">
        <div class="sec">Avance por colaborador</div>
        <ReporteChartOps 
          :datos="chartDataCalculada"
          :tema="temaActivo"
        />
      </div>

      <!-- 5. Fallas e Incidencias Reales & Rendimiento por Checklist -->
      <ReporteFallasCorrectivasOps 
        :fallas="incidencias"
        :checklists="resumenPorChecklist"
        :tema="temaActivo"
      />

      <!-- 6. Detalle de Tareas de Checklists con Filtros y Buscador -->
      <div v-if="tareas.length > 0" class="detalle-wrapper">
        <ReporteTablaDetalle
          :tareas="tareas"
          :colaborador-filtro-nombre="nombreColaboradorFiltroActivo"
          @limpiar-filtro-colaborador="limpiarFiltroColaborador"
        />
      </div>

      <!-- 7. Pie de Página -->
      <ReporteFooterOps 
        :texto="footerTexto"
        :tema="temaActivo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { 
  BarChart3, 
  Download, 
  Printer, 
  RefreshCw,
  Sun,
  Moon
} from 'lucide-vue-next'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { useReportes } from '~/composables/useReportes'
import ReporteHeaderOps from '~/components/reportes/ReporteHeaderOps.vue'
import ReporteBadgesOps from '~/components/reportes/ReporteBadgesOps.vue'
import ReporteColaboradoresOps from '~/components/reportes/ReporteColaboradoresOps.vue'
import ReporteChartOps from '~/components/reportes/ReporteChartOps.vue'
import ReporteFallasCorrectivasOps from '~/components/reportes/ReporteFallasCorrectivasOps.vue'
import ReporteTablaDetalle from '~/components/reportes/ReporteTablaDetalle.vue'
import ReporteFooterOps from '~/components/reportes/ReporteFooterOps.vue'

definePageMeta({
  middleware: ['admin'],
})

const supabase = useSupabaseClient()
const {
  cargando,
  tareas,
  incidencias,
  totalTareas,
  tareasCompletadas,
  porcentajeCumplimiento,
  totalFotosEvidencia,
  totalFallas,
  subFallas,
  resumenPorColaborador,
  resumenPorChecklist,
  cargarDatosReporte,
  exportarCSV
} = useReportes()

// Estado del tema: 'dark' (OPS Oscuro) o 'light' (Íntegro Brand Claro según SKILL.md)
const temaActivo = ref<'dark' | 'light'>('dark')

function toggleTema() {
  temaActivo.value = temaActivo.value === 'dark' ? 'light' : 'dark'
  if (import.meta.client) {
    localStorage.setItem('taskcc_reporte_tema', temaActivo.value)
  }
}

// Catálogos
const proyectos = ref<any[]>([])
const colaboradores = ref<any[]>([])

// Rangos Rápidos de Fecha (Por defecto 'todo' para mostrar todas las tareas asignadas)
const rangosRapidos = [
  { id: 'todo', label: 'Todo el Historial' },
  { id: 'este_mes', label: 'Este Mes' },
  { id: 'mes_anterior', label: 'Mes Anterior' },
  { id: 'esta_semana', label: 'Esta Semana' }
]

const rangoRapidoActivo = ref('todo')

// Filtros Reactivos
const filtros = reactive({
  proyectoId: 'todos' as string | number,
  colaboradorId: 'todos' as string | number,
  fechaInicio: '',
  fechaFin: ''
})

// Datos para el gráfico Chart.js calculados a partir de los colaboradores reales
const chartDataCalculada = computed(() => {
  const colabs = resumenPorColaborador.value
  return {
    labels: colabs.map(c => c.nombre),
    tareasAsignadas: colabs.map(c => c.totalAsignadas),
    tareasRealizadas: colabs.map(c => c.completadas),
    evidencias: colabs.map(c => c.totalFotos)
  }
})

// Textos dinámicos de cabecera y pie
const nombreProyectoSeleccionado = computed(() => {
  if (filtros.proyectoId && filtros.proyectoId !== 'todos') {
    const p = proyectos.value.find(proy => proy.id === Number(filtros.proyectoId))
    return p ? p.nombre : 'Proyecto'
  }
  return 'General'
})

const logoDerechoProyecto = computed(() => {
  return '/img/logos/LosAltosLogo.png'
})

const headerTitulo = computed(() => {
  if (filtros.proyectoId && filtros.proyectoId !== 'todos') {
    return `Resultados OPS ${nombreProyectoSeleccionado.value}`
  }
  return 'Resultados OPS'
})

const headerEyebrow = computed(() => {
  const hoy = new Date()
  const mesActual = format(hoy, 'MMMM yyyy')
  return `Reporte mensual · ${mesActual.charAt(0).toUpperCase() + mesActual.slice(1)}`
})

const headerBadge = computed(() => {
  const hoyStr = format(new Date(), 'dd/MM/yyyy')
  return `⚠ Actualizado al ${hoyStr} — Datos en tiempo real`
})

const footerTexto = computed(() => {
  const hoyStr = format(new Date(), 'dd/MM/yyyy')
  const mesActual = format(new Date(), 'MMMM yyyy')
  return `Resultados OPS ${nombreProyectoSeleccionado.value} · ${mesActual.charAt(0).toUpperCase() + mesActual.slice(1)} · Íntegro Commercial · Actualizado al ${hoyStr}`
})

const nombreColaboradorFiltroActivo = computed(() => {
  if (!filtros.colaboradorId || filtros.colaboradorId === 'todos') return ''
  const c = colaboradores.value.find(col => col.id === Number(filtros.colaboradorId))
  return c ? c.nombre : ''
})

function limpiarFiltroColaborador() {
  filtros.colaboradorId = 'todos'
  ejecutarConsulta()
}

// Aplicar rango por ID
function aplicarRangoPorId(id: string) {
  const hoy = new Date()
  rangoRapidoActivo.value = id

  if (id === 'este_mes') {
    filtros.fechaInicio = format(startOfMonth(hoy), 'yyyy-MM-dd')
    filtros.fechaFin = format(endOfMonth(hoy), 'yyyy-MM-dd')
  } else if (id === 'mes_anterior') {
    const mesPasado = subMonths(hoy, 1)
    filtros.fechaInicio = format(startOfMonth(mesPasado), 'yyyy-MM-dd')
    filtros.fechaFin = format(endOfMonth(mesPasado), 'yyyy-MM-dd')
  } else if (id === 'esta_semana') {
    filtros.fechaInicio = format(startOfWeek(hoy, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    filtros.fechaFin = format(endOfWeek(hoy, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  } else if (id === 'todo') {
    filtros.fechaInicio = ''
    filtros.fechaFin = ''
  }
}

function seleccionarRangoRapido(id: string) {
  aplicarRangoPorId(id)
  ejecutarConsulta()
}

function onCambioFechaManual() {
  rangoRapidoActivo.value = 'personalizado'
  ejecutarConsulta()
}

async function cargarCatalogos() {
  try {
    const [pRes, cRes] = await Promise.all([
      supabase.from('proyectos').select('id, nombre').eq('activo', true).order('nombre', { ascending: true }),
      supabase.from('colaboradores').select('id, nombre, email, telefono, roles(rol)').order('nombre', { ascending: true })
    ])
    proyectos.value = pRes.data || []
    colaboradores.value = (cRes.data || []).map(c => ({
      ...c,
      id: Number(c.id)
    }))
  } catch (err) {
    console.error('Error cargando catálogos:', err)
  }
}

async function onCambioProyecto() {
  ejecutarConsulta()
}

async function ejecutarConsulta() {
  try {
    await cargarDatosReporte({
      proyectoId: filtros.proyectoId,
      proyectoChecklistId: 'todos',
      colaboradorId: filtros.colaboradorId,
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin
    })
  } catch (err) {
    console.error('Error al ejecutar consulta de reporte:', err)
  }
}

function exportarReporteCSV() {
  exportarCSV(`reporte-ops-${nombreProyectoSeleccionado.value.toLowerCase().replace(/\s+/g, '-')}`)
}

function imprimirReporte() {
  window.print()
}

onMounted(async () => {
  if (import.meta.client) {
    const guardado = localStorage.getItem('taskcc_reporte_tema')
    if (guardado === 'light' || guardado === 'dark') {
      temaActivo.value = guardado
    }
  }
  aplicarRangoPorId('todo')
  await cargarCatalogos()
  await ejecutarConsulta()
})
</script>

<style scoped>
/* ==========================================================================
   ESTILOS GENERALES Y TEMAS (OSCURO OPS & ÍNTEGRO BRAND SEGÚN SKILL.MD)
   ========================================================================== */

.reportes-admin-container {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  min-height: 100vh;
  padding: 1.5rem;
  box-sizing: border-box;
  margin: -1rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Modo Oscuro (OPS Dark) */
.reportes-admin-container.theme-dark {
  background: #0d0d0d;
  color: #f0f0f0;
}

/* Modo Claro (Íntegro Brand según skills/SKILL.md) */
.reportes-admin-container.theme-light {
  background: #f8f9fa;
  color: #000000;
}

.page {
  max-width: 1140px;
  margin: 0 auto;
}

/* ==========================================================================
   BARRA SUPERIOR DE HERRAMIENTAS (TOOLBAR)
   ========================================================================== */

.toolbar-card {
  max-width: 1140px;
  margin: 0 auto 1.5rem auto;
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.theme-dark .toolbar-card {
  background: #161616;
  border: 0.5px solid #2a2a2a;
}
.theme-light .toolbar-card {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.toolbar-icon {
  padding: 0.625rem;
  border-radius: 1rem;
}
.theme-dark .toolbar-icon {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
}
.theme-light .toolbar-icon {
  background: rgba(195, 48, 45, 0.08);
  color: #C3302D;
  border: 1px solid rgba(195, 48, 45, 0.2);
}

.toolbar-title {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.theme-dark .toolbar-title {
  color: #ffffff;
}
.theme-light .toolbar-title {
  color: #000000;
}

.toolbar-badge {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.theme-dark .toolbar-badge {
  background: #fbbf24;
  color: #000000;
}
.theme-light .toolbar-badge {
  background: #C3302D;
  color: #ffffff;
}

.toolbar-subtitle {
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
}
.theme-dark .toolbar-subtitle {
  color: #a3a3a3;
}
.theme-light .toolbar-subtitle {
  color: #747376;
}

.theme-dark .toolbar-filters {
  border-top: 0.5px solid #222;
}
.theme-light .toolbar-filters {
  border-top: 1px solid #E1E2E4;
}

/* ==========================================================================
   BOTONES Y CONTROLES
   ========================================================================== */

.btn-ops {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 0.5px solid transparent;
}

.theme-dark .btn-ops-ghost {
  background: #1e1e1e;
  color: #ccc;
  border-color: #333;
}
.theme-dark .btn-ops-ghost:hover {
  background: #282828;
  color: #fff;
}
.theme-light .btn-ops-ghost {
  background: #f3f4f6;
  color: #374151;
  border-color: #E1E2E4;
}
.theme-light .btn-ops-ghost:hover {
  background: #e5e7eb;
  color: #000;
}

.theme-dark .btn-ops-primary {
  background: #fbbf24;
  color: #000000;
  border-color: #fbbf24;
}
.theme-dark .btn-ops-primary:hover {
  background: #f59e0b;
}
.theme-light .btn-ops-primary {
  background: #C3302D;
  color: #ffffff;
  border-color: #C3302D;
}
.theme-light .btn-ops-primary:hover {
  background: #a82623;
}

.theme-dark .btn-ops-theme {
  background: #1f1f1f;
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}
.theme-dark .btn-ops-theme:hover {
  background: #2a2a2a;
}
.theme-light .btn-ops-theme {
  background: #ffffff;
  color: #C3302D;
  border: 1px solid #C3302D;
}
.theme-light .btn-ops-theme:hover {
  background: rgba(195, 48, 45, 0.05);
}

.ops-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.theme-dark .ops-label {
  color: #888;
}
.theme-light .ops-label {
  color: #747376;
}

.ops-select, .ops-input {
  width: 100%;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
}
.theme-dark .ops-select, .theme-dark .ops-input {
  background: #1a1a1a;
  border: 0.5px solid #333;
  color: #e0e0e0;
}
.theme-dark .ops-select:focus, .theme-dark .ops-input:focus {
  border-color: #fbbf24;
}
.theme-light .ops-select, .theme-light .ops-input {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  color: #111827;
}
.theme-light .ops-select:focus, .theme-light .ops-input:focus {
  border-color: #C3302D;
}

.ops-btn-chip {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.theme-dark .ops-btn-chip {
  background: #1a1a1a;
  border: 0.5px solid #333;
  color: #aaa;
}
.theme-dark .ops-btn-chip.active {
  background: #fbbf24;
  color: #000;
  border-color: #fbbf24;
}
.theme-light .ops-btn-chip {
  background: #f3f4f6;
  border: 1px solid #E1E2E4;
  color: #4b5563;
}
.theme-light .ops-btn-chip.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.sec {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 12px 0 6px;
  padding-left: 2px;
}
.theme-dark .sec {
  color: #888;
}
.theme-light .sec {
  color: #747376;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  border-radius: 20px;
  max-width: 1140px;
  margin: 0 auto;
}
.theme-dark .loading-state {
  background: #161616;
  border: 0.5px solid #222;
}
.theme-light .loading-state {
  background: #ffffff;
  border: 1px solid #E1E2E4;
}

.loading-ring {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(251, 191, 36, 0.2);
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==========================================================================
   ESTILOS DE IMPRESIÓN / PDF
   ========================================================================== */
@media print {
  .reportes-admin-container {
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
  }
  .drawer-side,
  .navbar,
  footer,
  .toolbar-card {
    display: none !important;
  }
  .page {
    max-width: 100% !important;
  }
}
</style>
