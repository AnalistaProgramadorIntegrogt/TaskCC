<template>
  <div class="colab-section" :class="tema === 'light' ? 'light-mode' : 'dark-mode'">
    <div class="sec">Colaboradores del Sistema</div>

    <div v-if="listaColaboradores.length === 0" class="empty-state-card">
      <p class="text-xs font-semibold">No se encontraron colaboradores registrados en el sistema para este período o filtro.</p>
    </div>

    <div v-else class="colabs">
      <div 
        v-for="(colab, idx) in listaColaboradores" 
        :key="colab.colaboradorId || colab.id || colab.nombre"
        class="colab"
        :class="getCardClass(idx)"
      >
        <!-- Encabezado de la Tarjeta del Colaborador -->
        <div class="colab-head">
          <div class="av" :class="getAvatarClass(idx)">
            {{ getInitials(colab.nombre) }}
          </div>
          <div>
            <div class="cn">{{ colab.nombre }}</div>
            <div class="cr">{{ colab.rol || 'Colaborador' }}</div>
          </div>
        </div>

        <!-- Barra 1: Tareas Programadas -->
        <div class="prog-wrap">
          <div class="pt">
            <span class="pl">Tareas programadas</span>
            <span 
              class="pp" 
              :style="{ color: getPercentColor(colab.porcentaje || 0) }"
            >
              {{ colab.porcentaje || 0 }}%
            </span>
          </div>
          <div class="bar-bg">
            <div 
              class="bar-fill" 
              :class="getFillClass(colab.porcentaje || 0)"
              :style="{ width: `${Math.min(100, colab.porcentaje || 0)}%` }"
            ></div>
          </div>
        </div>

        <!-- Barra 2: Montajes Realizados -->
        <div class="prog-wrap">
          <div class="pt">
            <span class="pl">Montajes</span>
            <span 
              class="pp font-black" 
              :style="{ color: (colab.totalMontajes || 0) > 0 ? (tema === 'light' ? '#000000' : '#ffffff') : (tema === 'light' ? '#747376' : '#888') }"
            >
              {{ colab.totalMontajes || 0 }}
            </span>
          </div>
          <div class="bar-bg">
            <div 
              class="bar-fill" 
              :class="(colab.totalMontajes || 0) > 0 ? 'fill-blue' : 'fill-dim'"
              :style="{ width: `${Math.min(100, (colab.totalMontajes || 0) > 0 ? 100 : 0)}%` }"
            ></div>
          </div>
        </div>

        <!-- Mini Grid de 4 Métricas Reales -->
        <div class="mini">
          <div>
            <div class="mv" :style="{ color: tema === 'light' ? '#000000' : '#ffffff' }">
              {{ colab.totalAsignadas || 0 }}
            </div>
            <div class="ml">Asign.</div>
          </div>
          <div>
            <div class="mv" :style="{ color: getRealizColor(colab.porcentaje || 0) }">
              {{ colab.completadas || 0 }}
            </div>
            <div class="ml">Realiz.</div>
          </div>
          <div>
            <div class="mv" :style="{ color: (colab.totalFallas || 0) > 0 ? (tema === 'light' ? '#C3302D' : '#f87171') : '#10b981' }">
              {{ colab.totalFallas || 0 }}
            </div>
            <div class="ml">Fallas</div>
          </div>
          <div>
            <div class="mv" :style="{ color: tema === 'light' ? '#000000' : '#ffffff' }">
              {{ colab.totalMontajes || 0 }}
            </div>
            <div class="ml">Montajes</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    colaboradores?: any[]
    tema?: 'dark' | 'light'
  }>(),
  {
    colaboradores: () => [],
    tema: 'dark'
  }
)

const listaColaboradores = computed(() => props.colaboradores || [])

function getCardClass(index: number) {
  const mod = index % 3
  if (mod === 0) return 'cf'
  if (mod === 1) return 'cp'
  return 'cm'
}

function getAvatarClass(index: number) {
  const mod = index % 3
  if (mod === 0) return 'av-f'
  if (mod === 1) return 'av-p'
  return 'av-m'
}

function getInitials(nombre: string) {
  if (!nombre) return 'CO'
  const partes = nombre.trim().split(' ')
  if (partes.length >= 2) {
    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

function getPercentColor(pct: number) {
  if (pct >= 75) return '#10b981'
  if (pct >= 50) return props.tema === 'light' ? '#d97706' : '#fbbf24'
  return props.tema === 'light' ? '#C3302D' : '#f87171'
}

function getRealizColor(pct: number) {
  if (pct >= 75) return '#10b981'
  if (pct >= 50) return props.tema === 'light' ? '#d97706' : '#fbbf24'
  return props.tema === 'light' ? '#C3302D' : '#f87171'
}

function getFillClass(pct: number) {
  if (pct >= 75) return 'fill-g'
  if (pct >= 50) return 'fill-y'
  return 'fill-r'
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

.empty-state-card {
  padding: 2.5rem 1.5rem;
  text-align: center;
  border-radius: 16px;
}
.dark-mode .empty-state-card {
  background: #161616;
  border: 0.5px solid #222;
  color: #aaa;
}
.light-mode .empty-state-card {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  color: #747376;
}

.colabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 8px;
  margin-bottom: 0;
}
.colab {
  border-radius: 18px;
  padding: 1.2rem 1.3rem;
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark-mode .colab {
  background: #161616;
  border: 0.5px solid #222;
}
.light-mode .colab {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.colab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2.5px;
}
.cf::before {
  background: linear-gradient(90deg, #2563eb, #60a5fa);
}
.cp::before {
  background: linear-gradient(90deg, #c2410c, #fb923c);
}
.cm::before {
  background: linear-gradient(90deg, #15803d, #4ade80);
}
.colab-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 13px;
}
.av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
  font-family: 'Montserrat', -apple-system, sans-serif;
}
.av-f {
  background: rgba(96, 165, 250, 0.12);
  color: #2563eb;
  border: 1px solid rgba(96, 165, 250, 0.25);
}
.av-p {
  background: rgba(251, 146, 60, 0.12);
  color: #ea580c;
  border: 1px solid rgba(251, 146, 60, 0.25);
}
.av-m {
  background: rgba(74, 222, 128, 0.12);
  color: #16a34a;
  border: 1px solid rgba(74, 222, 128, 0.25);
}
.cn {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Montserrat', -apple-system, sans-serif;
}
.dark-mode .cn {
  color: #fff;
}
.light-mode .cn {
  color: #000000;
}

.cr {
  font-size: 10px;
  margin-top: 1px;
  font-weight: 500;
}
.dark-mode .cr {
  color: #aaa;
}
.light-mode .cr {
  color: #747376;
}

.prog-wrap {
  margin-bottom: 8px;
}
.pt {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.pl {
  font-size: 10px;
  font-weight: 600;
}
.dark-mode .pl {
  color: #aaa;
}
.light-mode .pl {
  color: #747376;
}

.pp {
  font-size: 15px;
  font-weight: 700;
}
.bar-bg {
  height: 5px;
  border-radius: 3px;
  overflow: hidden;
}
.dark-mode .bar-bg {
  background: #1e1e1e;
}
.light-mode .bar-bg {
  background: #e5e7eb;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.fill-g {
  background: #4ade80;
}
.fill-r {
  background: #C3302D;
}
.fill-y {
  background: #fbbf24;
}
.fill-blue {
  background: #3b82f6;
}
.fill-dim {
  background: #4b5563;
}
.mini {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 12px;
  padding-top: 10px;
}
.dark-mode .mini {
  border-top: 0.5px solid #1a1a1a;
}
.light-mode .mini {
  border-top: 1px solid #E1E2E4;
}

.mv {
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  font-family: 'Montserrat', -apple-system, sans-serif;
}
.ml {
  font-size: 8px;
  text-align: center;
  margin-top: 2px;
  font-weight: 600;
  text-transform: uppercase;
}
.dark-mode .ml {
  color: #aaa;
}
.light-mode .ml {
  color: #747376;
}

@media (max-width: 900px) {
  .colabs {
    grid-template-columns: 1fr;
  }
}
</style>
