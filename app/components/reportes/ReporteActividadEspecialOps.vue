<template>
  <div class="act-section" :class="tema === 'light' ? 'light-mode' : 'dark-mode'">
    <div class="sec">Actividad especial</div>
    <div class="act-row">
      <!-- 1. Fallas Totales -->
      <div class="act-card">
        <div>
          <div class="act-val" :style="{ color: tema === 'light' ? '#C3302D' : '#f87171' }">{{ fallasTotales }}</div>
          <div class="act-lbl">Fallas totales</div>
          <div v-if="subFallas" class="act-sub" :style="{ color: tema === 'light' ? '#C3302D' : '#f87171' }">{{ subFallas }}</div>
        </div>
      </div>

      <!-- 2. Correctivas -->
      <div class="act-card">
        <div>
          <div class="act-val" :style="{ color: tema === 'light' ? '#d97706' : '#fbbf24' }">{{ correctivasTotales }}</div>
          <div class="act-lbl">Correctivas</div>
          <div v-if="subCorrectivas" class="act-sub" :style="{ color: tema === 'light' ? '#d97706' : '#fbbf24' }">{{ subCorrectivas }}</div>
        </div>
      </div>

      <!-- 3. Extras -->
      <div class="act-card">
        <div>
          <div class="act-val" :style="{ color: tema === 'light' ? '#000000' : '#ffffff' }">{{ extrasTotales }}</div>
          <div class="act-lbl">Extras</div>
          <div v-if="subExtras" class="act-sub" :style="{ color: tema === 'light' ? '#2563eb' : '#60a5fa' }">{{ subExtras }}</div>
        </div>
      </div>

      <!-- 4. Montajes -->
      <div class="act-card">
        <div>
          <div class="act-val" :style="{ color: tema === 'light' ? '#000000' : '#ffffff' }">{{ montajesTotales }}</div>
          <div class="act-lbl">Montajes</div>
          <div v-if="subMontajes" class="act-sub" :style="{ color: tema === 'light' ? '#747376' : '#aaa' }">{{ subMontajes }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    fallasTotales?: number
    subFallas?: string
    correctivasTotales?: number
    subCorrectivas?: string
    extrasTotales?: number
    subExtras?: string
    montajesTotales?: number
    subMontajes?: string
    tema?: 'dark' | 'light'
  }>(),
  {
    fallasTotales: 2,
    subFallas: '1 pendiente',
    correctivasTotales: 13,
    subCorrectivas: '2 pendientes',
    extrasTotales: 22,
    subExtras: 'ADMON 9 · MKT 11 · SOL 2',
    montajesTotales: 8,
    subMontajes: 'Fredy 5 · Pedro 1 · Miguel 2',
    tema: 'dark'
  }
)
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

.act-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.act-card {
  border-radius: 14px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark-mode .act-card {
  background: #161616;
  border: 0.5px solid #222;
}
.light-mode .act-card {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.act-val {
  font-size: 20px;
  font-weight: 700;
  font-family: 'Montserrat', -apple-system, sans-serif;
}
.act-lbl {
  font-size: 10px;
  margin-top: 1px;
  font-weight: 600;
}
.dark-mode .act-lbl {
  color: #aaa;
}
.light-mode .act-lbl {
  color: #747376;
}

.act-sub {
  font-size: 9px;
  margin-top: 2px;
  font-weight: 600;
}
@media (max-width: 768px) {
  .act-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .act-row {
    grid-template-columns: 1fr;
  }
}
</style>
