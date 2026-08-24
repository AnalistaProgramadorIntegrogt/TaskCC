<template>
  <div class="fallas-correctivas-section" :class="tema === 'light' ? 'light-mode' : 'dark-mode'">
    <div class="sec">Fallas e Incidencias Registradas</div>
    <div class="two-col">
      <!-- Panel 1: Fallas Registradas (Incidencias Reales de la BD) -->
      <div class="panel">
        <div class="phdr">
          <span class="ptitle flex items-center gap-1.5">
            <AlertTriangle :size="14" class="text-rose-500" />
            <span>Fallas Registradas (Incidencias)</span>
          </span>
          <span class="pcount">
            {{ fallasCountTexto }}
          </span>
        </div>
        <div class="table-container">
          <table class="dt">
            <thead>
              <tr>
                <th>Descripción / Título</th>
                <th>Colaborador</th>
                <th>Fecha</th>
                <th style="text-align: center">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="listaFallas.length === 0">
                <td colspan="4" class="text-center py-6 text-xs empty-td">
                  ✓ No se encontraron fallas ni incidencias en este período.
                </td>
              </tr>
              <tr v-for="falla in listaFallas" :key="falla.id">
                <td class="tarea-name">
                  <div class="font-bold text-xs">{{ falla.titulo }}</div>
                  <div v-if="falla.descripcion && falla.descripcion !== falla.titulo" class="text-[10px] text-neutral-400 truncate max-w-xs">
                    {{ falla.descripcion }}
                  </div>
                  <!-- Mini preview de foto si existe -->
                  <a 
                    v-if="falla.fotoUrl" 
                    :href="falla.fotoUrl" 
                    target="_blank"
                    class="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline mt-0.5"
                  >
                    <Camera :size="11" />
                    <span>Ver foto</span>
                  </a>
                </td>
                <td class="whitespace-nowrap">{{ falla.colaboradorNombre }}</td>
                <td class="whitespace-nowrap">{{ formatearFecha(falla.fecha) }}</td>
                <td style="text-align: center">
                  <span 
                    class="pill"
                    :class="falla.estadoTexto === 'Listo' ? 'pill-g' : 'pill-r'"
                  >
                    {{ falla.estadoTexto }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel 2: Desglose por Tipo de Checklist Real de la BD -->
      <div class="panel">
        <div class="phdr">
          <span class="ptitle flex items-center gap-1.5">
            <ClipboardList :size="14" class="text-primary" />
            <span>Rendimiento por Checklist</span>
          </span>
          <span class="pcount" :style="{ color: tema === 'light' ? '#d97706' : '#fbbf24' }">
            {{ checklists.length }} {{ checklists.length === 1 ? 'checklist' : 'checklists' }}
          </span>
        </div>
        <div class="table-container">
          <table class="dt">
            <thead>
              <tr>
                <th>Checklist</th>
                <th>Asignadas</th>
                <th>Realizadas</th>
                <th style="text-align: right">Cumplimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="checklists.length === 0">
                <td colspan="4" class="text-center py-6 text-xs empty-td">
                  No hay checklists asignados en este período.
                </td>
              </tr>
              <tr v-for="chk in checklists" :key="chk.id">
                <td>
                  <div class="flex items-center gap-2">
                    <span 
                      class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: chk.color || '#3b82f6' }"
                    ></span>
                    <span class="font-bold text-xs">{{ chk.nombre }}</span>
                  </div>
                </td>
                <td>{{ chk.total }}</td>
                <td>{{ chk.completadas }}</td>
                <td style="text-align: right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-16 bg-neutral-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                      <div 
                        class="bg-emerald-500 h-full rounded-full"
                        :style="{ width: `${chk.porcentaje}%` }"
                      ></div>
                    </div>
                    <span 
                      class="font-black text-xs"
                      :style="{ color: chk.porcentaje >= 75 ? '#10b981' : chk.porcentaje >= 50 ? '#fbbf24' : '#C3302D' }"
                    >
                      {{ chk.porcentaje }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, ClipboardList, Camera } from 'lucide-vue-next'
import type { IncidenciaReporteItem, ChecklistResumenReporte } from '~/composables/useReportes'

const props = withDefaults(
  defineProps<{
    fallas?: IncidenciaReporteItem[]
    checklists?: ChecklistResumenReporte[]
    tema?: 'dark' | 'light'
  }>(),
  {
    fallas: () => [],
    checklists: () => [],
    tema: 'dark'
  }
)

const listaFallas = computed(() => props.fallas || [])

const fallasCountTexto = computed(() => {
  const tot = listaFallas.value.length
  const fin = listaFallas.value.filter(f => f.estadoTexto === 'Listo').length
  const pend = tot - fin
  return `${tot} total · ${fin} resuelta${fin !== 1 ? 's' : ''} · ${pend} pendiente${pend !== 1 ? 's' : ''}`
})

function formatearFecha(f: string) {
  if (!f) return ''
  try {
    const partes = f.split('-')
    if (partes.length === 3) {
      return `${parseInt(partes[2])}/${parseInt(partes[1])}`
    }
    return f
  } catch {
    return f
  }
}
</script>

<style scoped>
.sec {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 12px 0 6px;
  padding-left: 2px;
}
.dark-mode .sec {
  color: #888;
}
.light-mode .sec {
  color: #747376;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.panel {
  border-radius: 16px;
  overflow: hidden;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark-mode .panel {
  background: #161616;
  border: 0.5px solid #222;
}
.light-mode .panel {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.phdr {
  padding: 10px 12px 8px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.dark-mode .phdr {
  border-bottom: 0.5px solid #1a1a1a;
}
.light-mode .phdr {
  border-bottom: 1px solid #E1E2E4;
  background: #fdfdfd;
}

.ptitle {
  font-size: 12px;
  font-weight: 700;
  font-family: 'Montserrat', -apple-system, sans-serif;
}
.dark-mode .ptitle {
  color: #fff;
}
.light-mode .ptitle {
  color: #000000;
}

.pcount {
  font-size: 9px;
  font-weight: 600;
}
.dark-mode .pcount {
  color: #aaa;
}
.light-mode .pcount {
  color: #747376;
}

.table-container {
  overflow-x: auto;
}
table.dt {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
table.dt th {
  font-weight: 700;
  font-size: 8px;
  letter-spacing: 0.06em;
  padding: 6px 10px;
  text-align: left;
  text-transform: uppercase;
}
.dark-mode table.dt th {
  background: #0f0f0f;
  color: #aaa;
  border-bottom: 0.5px solid #1a1a1a;
}
.light-mode table.dt th {
  background: #f9fafb;
  color: #747376;
  border-bottom: 1px solid #E1E2E4;
}

table.dt td {
  padding: 6px 10px;
  line-height: 1.35;
  vertical-align: middle;
}
.dark-mode table.dt td {
  color: #e0e0e0;
  border-bottom: 0.3px solid #171717;
}
.light-mode table.dt td {
  color: #1f2937;
  border-bottom: 1px solid #f3f4f6;
}

table.dt tr:last-child td {
  border-bottom: none;
}

.dark-mode .empty-td {
  color: #aaa;
}
.light-mode .empty-td {
  color: #747376;
}

.pill {
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 5px;
  font-weight: 700;
  display: inline-block;
}
.pill-g {
  background: rgba(74, 222, 128, 0.08);
  color: #16a34a;
  border: 0.5px solid rgba(74, 222, 128, 0.25);
}
.pill-r {
  background: rgba(195, 48, 45, 0.08);
  color: #C3302D;
  border: 0.5px solid rgba(195, 48, 45, 0.25);
}

.tarea-name {
  white-space: normal;
  max-width: 280px;
  line-height: 1.35;
}
@media (max-width: 768px) {
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
