<template>
  <div class="badge-strip" :class="tema === 'light' ? 'light-mode' : 'dark-mode'">
    <!-- 1. Tareas Asignadas -->
    <div class="badge b-n">
      <div class="badge-val" :style="{ color: tema === 'light' ? '#000000' : '#ffffff' }">
        {{ totalAsignadas }}
      </div>
      <div class="badge-lbl">Tareas asignadas</div>
    </div>

    <!-- 2. Tareas Realizadas -->
    <div class="badge b-a">
      <div class="badge-val" :style="{ color: tema === 'light' ? '#d97706' : '#fbbf24' }">
        {{ totalRealizadas }}
      </div>
      <div class="badge-lbl">Tareas realizadas</div>
    </div>

    <!-- 3. Avance General -->
    <div class="badge b-a">
      <div class="badge-val" :style="{ color: tema === 'light' ? '#d97706' : '#fbbf24' }">
        {{ porcentajeAvance }}%
      </div>
      <div class="badge-lbl">Avance general</div>
      <div v-if="subAvance" class="badge-sub" :style="{ color: tema === 'light' ? '#d97706' : '#fbbf24' }">
        {{ subAvance }}
      </div>
    </div>

    <!-- 4. Fallas Registradas (Incidencias Reales) -->
    <div class="badge b-r">
      <div class="badge-val" :style="{ color: tema === 'light' ? '#C3302D' : '#f87171' }">
        {{ totalFallas }}
      </div>
      <div class="badge-lbl">Fallas registradas</div>
      <div v-if="subFallas" class="badge-sub" :style="{ color: tema === 'light' ? '#C3302D' : '#f87171' }">
        {{ subFallas }}
      </div>
    </div>

    <!-- 5. Evidencias Fotográficas -->
    <div class="badge b-g">
      <div class="badge-val" :style="{ color: tema === 'light' ? '#047857' : '#4ade80' }">
        {{ totalEvidencias }}
      </div>
      <div class="badge-lbl">Con Evidencia</div>
      <div v-if="subEvidencias" class="badge-sub" :style="{ color: tema === 'light' ? '#047857' : '#4ade80' }">
        {{ subEvidencias }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    totalAsignadas?: number
    totalRealizadas?: number
    porcentajeAvance?: number
    subAvance?: string
    totalFallas?: number
    subFallas?: string
    totalEvidencias?: number
    subEvidencias?: string
    tema?: 'dark' | 'light'
  }>(),
  {
    totalAsignadas: 0,
    totalRealizadas: 0,
    porcentajeAvance: 0,
    subAvance: '',
    totalFallas: 0,
    subFallas: '',
    totalEvidencias: 0,
    subEvidencias: '',
    tema: 'dark'
  }
)
</script>

<style scoped>
.badge-strip {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.badge {
  flex: 1;
  border-radius: 14px;
  padding: 0.9rem 1rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  height: auto;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark-mode .badge {
  background: #161616;
  border: 0.5px solid #242424;
}
.light-mode .badge {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.badge::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
}
.b-g::after {
  background: #4ade80;
}
.b-r::after {
  background: #C3302D;
}
.b-n::after {
  background: #89888A;
}
.b-a::after {
  background: #fbbf24;
}

.badge-val {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  font-family: 'Montserrat', -apple-system, sans-serif;
}
.badge-lbl {
  font-size: 9px;
  margin-top: 4px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 600;
}
.dark-mode .badge-lbl {
  color: #aaa;
}
.light-mode .badge-lbl {
  color: #747376;
}

.badge-sub {
  font-size: 10px;
  font-weight: 600;
  margin-top: 3px;
}
@media (max-width: 768px) {
  .badge-strip {
    flex-wrap: wrap;
  }
  .badge {
    flex: 1 1 calc(50% - 8px);
  }
}
@media (max-width: 480px) {
  .badge {
    flex: 1 1 100%;
  }
}
</style>
