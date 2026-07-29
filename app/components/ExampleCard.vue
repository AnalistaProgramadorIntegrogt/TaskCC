<template>
  <div class="card w-96 bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{{ title }}</h2>
      <p>{{ description }}</p>
      <div class="card-actions justify-end mt-4">
        <button class="btn btn-primary" @click="$emit('action')">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  buttonText: string
}>()

defineEmits(['action'])
</script>
