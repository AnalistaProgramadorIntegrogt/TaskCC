<template>
  <div class="flex items-center justify-center min-h-screen">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/admin/auditoria')
    },
  ],
})
</script>
