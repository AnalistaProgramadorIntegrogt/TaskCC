<template>
  <div class="extras-montajes-section" :class="tema === 'light' ? 'light-mode' : 'dark-mode'">
    <div class="sec">Extras y montajes</div>
    <div class="two-col">
      <!-- Panel 1: Tareas Extras por Área -->
      <div class="panel">
        <div class="phdr">
          <span class="ptitle">Tareas extras por área</span>
          <span class="pcount">{{ totalExtras }} total</span>
        </div>
        <div class="table-container">
          <table class="dt">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Fecha</th>
                <th style="text-align: right">Resp.</th>
              </tr>
            </thead>
            <tbody>
              <!-- Iterar por cada grupo de área -->
              <template v-for="(grupo, gIdx) in gruposAreas" :key="gIdx">
                <tr class="area-sep">
                  <td colspan="3">
                    <span :class="getAreaClass(grupo.area)">{{ grupo.area }}</span>
                    · {{ grupo.items.length }} {{ grupo.items.length === 1 ? 'tarea' : 'tareas' }}
                  </td>
                </tr>
                <tr v-for="(item, iIdx) in grupo.items" :key="iIdx">
                  <td class="tarea-name">&nbsp;&nbsp;{{ item.descripcion }}</td>
                  <td class="whitespace-nowrap">{{ item.fecha }}</td>
                  <td style="text-align: right" class="whitespace-nowrap resp-td">{{ item.responsable }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel 2: Registro de Montajes -->
      <div class="panel">
        <div class="phdr">
          <span class="ptitle">Registro de montajes</span>
          <span class="pcount">{{ montajesHeaderTexto }}</span>
        </div>
        <div class="table-container">
          <table class="dt">
            <thead>
              <tr>
                <th>Colaborador / Evento</th>
                <th style="text-align: right">Montajes</th>
              </tr>
            </thead>
            <tbody>
              <!-- Iterar por cada colaborador en montajes -->
              <template v-for="(grupoM, mIdx) in gruposMontajes" :key="mIdx">
                <tr class="area-sep">
                  <td colspan="2">
                    <span :style="{ color: getColabColor(grupoM.colaborador) }">
                      {{ grupoM.colaborador.toUpperCase() }}
                    </span>
                    · {{ grupoM.total }} {{ grupoM.total === 1 ? 'montaje' : 'montajes' }}
                  </td>
                </tr>
                <tr v-for="(itemM, iIdx) in grupoM.items" :key="iIdx">
                  <td class="tarea-name">&nbsp;&nbsp;{{ itemM.descripcion }}</td>
                  <td style="text-align: right" class="whitespace-nowrap resp-td">{{ itemM.responsable }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ExtraAreaGrupo {
  area: 'ADMON' | 'MKT' | 'SOLUSERSA' | string
  items: Array<{
    descripcion: string
    fecha: string
    responsable: string
  }>
}

export interface MontajeColaboradorGrupo {
  colaborador: string
  total: number
  items: Array<{
    descripcion: string
    responsable: string
  }>
}

const props = withDefaults(
  defineProps<{
    areas?: ExtraAreaGrupo[]
    montajes?: MontajeColaboradorGrupo[]
    tema?: 'dark' | 'light'
  }>(),
  {
    areas: () => [
      {
        area: 'ADMON',
        items: [
          { descripcion: 'Riego de grama', fecha: '1/08', responsable: 'Fredy' },
          { descripcion: 'Toma de medidas de la entrada principal', fecha: '2/08', responsable: 'Fredy' },
          { descripcion: 'Acompañamiento a instalacion de A/C', fecha: '4/08', responsable: 'Miguel' },
          { descripcion: 'Seguimiento a filtracion', fecha: '4/08', responsable: 'Fredy' },
          { descripcion: 'Seguimiento a tableros electronicos de albamar', fecha: '3/08', responsable: 'Miguel' },
          { descripcion: 'Acompañamiento a Multiservicios para instalacion de tornillo', fecha: '4/08', responsable: 'Miguel' },
          { descripcion: 'Seguimiento a filtracion', fecha: '4/08', responsable: 'Fredy' },
          { descripcion: 'Riego de grama', fecha: '4/08', responsable: 'Miguel' },
          { descripcion: 'Liberacion de Mingitorio', fecha: '4/08', responsable: 'Miguel' }
        ]
      },
      {
        area: 'MKT',
        items: [
          { descripcion: 'Retiro y Traslado de publicidad a la bodega de mercadeo', fecha: '1/08', responsable: 'Fredy' },
          { descripcion: 'Riego de grama', fecha: '1/08-2/08', responsable: 'Fredy' },
          { descripcion: 'Seguimiento a MKT', fecha: '2/08', responsable: 'Fredy' },
          { descripcion: 'Seguimiento a filtracion', fecha: '2/08', responsable: 'Fredy' },
          { descripcion: 'Retiro de publicidad en vidrio del FC', fecha: '5/08', responsable: 'Miguel' },
          { descripcion: 'Retiro y colocacion de publicidad', fecha: '4/08', responsable: 'Fredy' },
          { descripcion: 'Retiro de banderolas publicitarias frente campero', fecha: '8/08', responsable: 'Fredy' },
          { descripcion: 'Instalacion de publicidad en mupis', fecha: '8/08', responsable: 'Fredy' },
          { descripcion: 'Retiro de publicidad en TV', fecha: '9/08', responsable: 'Fredy' },
          { descripcion: 'Recepcion de coloro', fecha: '10/08', responsable: 'Miguel' },
          { descripcion: 'Apoyo a Miguel con podado de redondel', fecha: '10/08', responsable: 'Fredy' }
        ]
      },
      {
        area: 'SOLUSERSA',
        items: [
          { descripcion: 'Seguimiento mingtorio 1 y 2', fecha: '4/08', responsable: 'Fredy' },
          { descripcion: 'Acompañamiento a Termnix para fumigacion', fecha: '6/08', responsable: 'Miguel' }
        ]
      }
    ],
    montajes: () => [
      {
        colaborador: 'Fredy',
        total: 5,
        items: [
          { descripcion: 'Montajes y desmontajes en eventos agosto', responsable: 'Fredy' }
        ]
      },
      {
        colaborador: 'Pedro',
        total: 1,
        items: [
          { descripcion: 'Montaje durante agosto', responsable: 'Pedro' }
        ]
      },
      {
        colaborador: 'Miguel',
        total: 2,
        items: [
          { descripcion: 'Montajes durante agosto', responsable: 'Miguel' }
        ]
      }
    ],
    tema: 'dark'
  }
)

const gruposAreas = computed(() => props.areas || [])
const gruposMontajes = computed(() => props.montajes || [])

const totalExtras = computed(() => {
  return gruposAreas.value.reduce((acc, g) => acc + g.items.length, 0)
})

const montajesHeaderTexto = computed(() => {
  const tot = gruposMontajes.value.reduce((acc, m) => acc + m.total, 0)
  const partes = gruposMontajes.value.map(m => `${m.colaborador} ${m.total}`)
  return `${tot} eventos — ${partes.join(' · ')}`
})

function getAreaClass(area: string) {
  const a = area.toUpperCase()
  if (a.includes('ADMON')) return 'admon'
  if (a.includes('MKT')) return 'mkt'
  if (a.includes('SOL')) return 'sol'
  return 'admon'
}

function getColabColor(colab: string) {
  const c = colab.toUpperCase()
  if (c.includes('FREDY')) return props.tema === 'light' ? '#2563eb' : '#60a5fa'
  if (c.includes('PEDRO')) return props.tema === 'light' ? '#ea580c' : '#fb923c'
  if (c.includes('MIGUEL')) return props.tema === 'light' ? '#16a34a' : '#4ade80'
  return props.tema === 'light' ? '#d97706' : '#fbbf24'
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

.dark-mode .resp-td {
  color: #aaa;
}
.light-mode .resp-td {
  color: #747376;
}

.area-sep td {
  padding: 6px 10px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.dark-mode .area-sep td {
  background: #0f0f0f !important;
  border-top: 0.5px solid #1e1e1e !important;
  border-bottom: 0.5px solid #1a1a1a !important;
  color: #aaa;
}
.light-mode .area-sep td {
  background: #f3f4f6 !important;
  border-top: 1px solid #E1E2E4 !important;
  border-bottom: 1px solid #E1E2E4 !important;
  color: #747376;
}

.admon {
  color: #2563eb;
}
.mkt {
  color: #C3302D;
}
.sol {
  color: #7c3aed;
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
