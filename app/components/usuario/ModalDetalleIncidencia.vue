<script setup lang="ts">
import { AlertTriangle, Calendar, Clock, FolderKanban, X, ExternalLink } from 'lucide-vue-next'
import type { Incidencia } from '~/composables/useIncidencias'

defineProps({
  isOpen: { type: Boolean, default: false },
  incidencia: { type: Object as () => Incidencia | null, default: null }
})

const emit = defineEmits(['cerrar'])
</script>

<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen && incidencia }">
    <div v-if="incidencia" class="modal-box max-w-2xl bg-base-100 p-6 shadow-2xl border border-base-200 rounded-3xl space-y-5">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 pb-4 border-b border-base-200">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
            <AlertTriangle class="h-6 w-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-warning badge-sm font-bold uppercase text-[10px]">
                Incidencia Registrada
              </span>
              <span class="badge badge-outline badge-sm text-[10px] font-mono">
                #{{ incidencia.id }}
              </span>
            </div>
            <h3 class="text-xl font-black text-base-content mt-1 leading-snug">
              {{ incidencia.titulo }}
            </h3>
          </div>
        </div>

        <button 
          class="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-base-content" 
          @click="emit('cerrar')"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Metadata Badges -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-base-200/60 p-3.5 rounded-2xl border border-base-200 text-xs">
        <div class="flex items-center gap-2 text-base-content/80 font-medium">
          <Calendar :size="16" class="text-primary flex-shrink-0" />
          <span>{{ incidencia.fecha }}</span>
        </div>
        <div class="flex items-center gap-2 text-base-content/80 font-medium">
          <Clock :size="16" class="text-warning flex-shrink-0" />
          <span>{{ incidencia.hora || 'Sin hora' }}</span>
        </div>
        <div class="flex items-center gap-2 text-base-content/80 font-medium truncate">
          <FolderKanban :size="16" class="text-secondary flex-shrink-0" />
          <span class="truncate">{{ incidencia.proyecto?.nombre || 'General' }}</span>
        </div>
      </div>

      <!-- Descripción -->
      <div class="space-y-1.5">
        <h4 class="text-xs font-extrabold text-base-content/70 uppercase tracking-wider">
          Descripción
        </h4>
        <div class="p-4 bg-base-200/40 rounded-2xl border border-base-200 text-sm text-base-content whitespace-pre-wrap leading-relaxed">
          {{ incidencia.descripcion || 'Sin descripción detallada proporcionada.' }}
        </div>
      </div>

      <!-- Evidencia Fotográfica -->
      <div v-if="incidencia.foto_url" class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-extrabold text-base-content/70 uppercase tracking-wider">
            Fotografía Adjunta
          </h4>
          <a 
            :href="incidencia.foto_url" 
            target="_blank" 
            class="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Abrir imagen original <ExternalLink :size="12" />
          </a>
        </div>
        
        <div class="rounded-2xl border border-base-300 overflow-hidden bg-base-300/30 flex justify-center max-h-80">
          <img 
            :src="incidencia.foto_url" 
            alt="Evidencia de Incidencia" 
            class="w-full h-full object-contain max-h-80 hover:scale-[1.02] transition-transform"
          />
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="modal-action pt-4 border-t border-base-200 flex justify-end">
        <button class="btn btn-neutral btn-sm rounded-xl font-bold px-6" @click="emit('cerrar')">
          Cerrar
        </button>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop" @click="emit('cerrar')">
      <button>cerrar</button>
    </form>
  </dialog>
</template>
