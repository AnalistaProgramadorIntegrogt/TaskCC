<template>
  <div class="header" :class="tema === 'light' ? 'light-mode' : 'dark-mode'">
    <!-- Logo Izquierdo: Íntegro Commercial -->
    <img 
      v-if="logoIzquierdoUrl"
      :src="logoIzquierdoUrl" 
      class="logo-ig" 
      alt="Íntegro Commercial" 
    />
    <div v-else class="logo-placeholder">
      <span class="font-black text-xs tracking-wider text-primary">INTEGRO</span>
    </div>

    <!-- Centro: Título y Período -->
    <div class="header-center">
      <div class="header-eyebrow">{{ eyebrow }}</div>
      <div class="header-main">
        {{ titulo }}<span class="brand-dot" aria-hidden="true">.</span>
      </div>
      <div class="header-sub">{{ subtitulo }}</div>
      <div v-if="badgeActualizacion" class="update-badge">
        {{ badgeActualizacion }}
      </div>
    </div>

    <!-- Logo Derecho: Proyecto -->
    <img 
      v-if="logoDerechoUrl"
      :src="logoDerechoUrl" 
      class="logo-la" 
      alt="Logo Proyecto" 
    />
    <div v-else class="logo-placeholder">
      <span class="font-black text-xs tracking-wider">{{ nombreProyectoCorto }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    titulo?: string
    subtitulo?: string
    eyebrow?: string
    badgeActualizacion?: string
    logoIzquierdoUrl?: string
    logoDerechoUrl?: string
    nombreProyectoCorto?: string
    tema?: 'dark' | 'light'
  }>(),
  {
    titulo: 'Resultados OPS',
    subtitulo: 'Mantenimiento & Operaciones',
    eyebrow: 'Reporte del Sistema',
    badgeActualizacion: '',
    logoIzquierdoUrl: '/img/logos/BLANCO 500px.png',
    logoDerechoUrl: '/img/logos/LosAltosLogo.png',
    nombreProyectoCorto: 'Proyecto',
    tema: 'dark'
  }
)
</script>

<style scoped>
.header {
  border-radius: 20px;
  padding: 1.75rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 2rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.header.dark-mode {
  background: #161616;
  border: 0.5px solid #2a2a2a;
}
.header.light-mode {
  background: #ffffff;
  border: 1px solid #E1E2E4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.logo-ig {
  height: 80px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}
.logo-la {
  height: 70px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}
.logo-placeholder {
  height: 60px;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  padding: 0 12px;
}
.dark-mode .logo-placeholder {
  background: #1f1f1f;
  border: 0.5px solid #333;
  color: #fff;
}
.light-mode .logo-placeholder {
  background: #f3f4f6;
  border: 1px solid #E1E2E4;
  color: #000;
}

.header-center {
  text-align: center;
  flex: 1;
}
.header-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.dark-mode .header-eyebrow {
  color: #aaa;
}
.light-mode .header-eyebrow {
  color: #747376;
}

.header-main {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  font-family: 'Montserrat', -apple-system, sans-serif;
}
.dark-mode .header-main {
  color: #fff;
}
.light-mode .header-main {
  color: #000000;
}

.brand-dot {
  color: #C3302D;
}

.header-sub {
  font-size: 11px;
  margin-top: 5px;
  letter-spacing: 0.03em;
  font-weight: 500;
}
.dark-mode .header-sub {
  color: #aaa;
}
.light-mode .header-sub {
  color: #747376;
}

.update-badge {
  font-size: 10px;
  border-radius: 8px;
  padding: 3px 10px;
  margin-top: 6px;
  display: inline-block;
  font-weight: 600;
}
.dark-mode .update-badge {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border: 0.5px solid rgba(251, 191, 36, 0.2);
}
.light-mode .update-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    padding: 1.25rem 1rem;
    gap: 1rem;
  }
  .logo-ig, .logo-la {
    height: 50px;
  }
}
</style>
