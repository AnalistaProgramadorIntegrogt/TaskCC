<template>
  <div class="footer" :class="tema === 'light' ? 'light-mode' : 'dark-mode'">
    {{ texto }}
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    texto?: string
    tema?: 'dark' | 'light'
  }>(),
  {
    texto: 'Resultados OPS Los Altos · Agosto 2026 · Íntegro Commercial · Actualizado al 10/08/2026',
    tema: 'dark'
  }
)
</script>

<style scoped>
.footer {
  text-align: center;
  font-size: 9px;
  padding-top: 14px;
  margin-top: 12px;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.dark-mode.footer {
  color: #555;
  border-top: 0.5px solid #1a1a1a;
}

.light-mode.footer {
  color: #747376;
  border-top: 1px solid #E1E2E4;
}
</style>
