<script setup>
const route = useRoute()
const proyectoId = Number(route.params.id)

const { dias, rangoTexto, semanaSiguiente, semanaAnterior, irAMes } = useSemanaUTC6()
const { puede } = usePermisos()
const {
  cargarSemanaProyecto,
  cargarRangoProyecto,
  marcarComoHecha,
  desmarcarTarea,
  quitarTarea
} = useChecklistData()

const supabase = useSupabaseClient()

const proyecto = ref(null)
const semana = ref([])
const eventosMes = ref([])
const cargando = ref(false)
const vistaActiva = ref('lista') // 'lista' o 'calendario'
const mostrarModalFoto = ref(false)
const tareaActivaParaFoto = ref(null)

async function cargarProyecto() {
  const { data } = await supabase.from('proyectos').select('*').eq('id', proyectoId).single()
  proyecto.value = data
}

async function refrescarSemana() {
  if (vistaActiva.value !== 'lista') return
  cargando.value = true
  try {
    semana.value = await cargarSemanaProyecto(proyectoId, dias.value)
  } finally {
    cargando.value = false
  }
}

async function refrescarMes(inicio, fin) {
  cargando.value = true
  try {
    // Formatear fechas si vienen como Date de date-fns
    const fInicio = inicio.toISOString ? inicio.toISOString().split('T')[0] : inicio
    const fFin = fin.toISOString ? fin.toISOString().split('T')[0] : fin
    eventosMes.value = await cargarRangoProyecto(proyectoId, fInicio, fFin)
  } finally {
    cargando.value = false
  }
}

// Para actualizar la UI sin recargar todo
function actualizarTareaEnSemana(tareaId, actualizacion) {
  // Actualizar en vista lista (semana)
  for (const dia of semana.value) {
    const idx = dia.tareas?.findIndex(t => t.id === tareaId)
    if (idx !== -1 && idx !== undefined) {
      dia.tareas[idx] = { ...dia.tareas[idx], ...actualizacion }
      break
    }
  }
  
  // Actualizar en vista calendario (mes)
  const idxMes = eventosMes.value.findIndex(t => t.id === tareaId)
  if (idxMes !== -1) {
    eventosMes.value[idxMes] = { ...eventosMes.value[idxMes], ...actualizacion }
  }
}

function iniciarMarcado(tarea) {
  tareaActivaParaFoto.value = tarea
  mostrarModalFoto.value = true
}

async function confirmarFoto(archivo) {
  mostrarModalFoto.value = false
  if (!tareaActivaParaFoto.value) return
  
  const tareaId = tareaActivaParaFoto.value.id
  // Resolvemos temporalmente con null hasta que tengamos el current colaborador de la sesión
  const actualizada = await marcarComoHecha(tareaId, archivo, null) 
  actualizarTareaEnSemana(tareaId, actualizada)
  tareaActivaParaFoto.value = null
}

async function alDesmarcar(tareaId) {
  const actualizada = await desmarcarTarea(tareaId)
  actualizarTareaEnSemana(tareaId, actualizada)
}

async function alQuitarTarea(tareaId) {
  await quitarTarea(tareaId)
  // Remover de la UI (semana)
  for (const dia of semana.value) {
    if (dia.tareas) {
      dia.tareas = dia.tareas.filter(t => t.id !== tareaId)
    }
  }
  // Remover de la UI (mes)
  eventosMes.value = eventosMes.value.filter(t => t.id !== tareaId)
}

watch([dias], refrescarSemana)
watch(vistaActiva, (nuevaVista) => {
  if (nuevaVista === 'lista' && !semana.value.length) {
    refrescarSemana()
  }
})

onMounted(async () => {
  await cargarProyecto()
  await refrescarSemana()
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-4 p-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/proyectos" class="btn btn-ghost btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Volver
        </NuxtLink>
        <h1 class="text-2xl font-bold">
          Checklist <span v-if="proyecto" class="text-base-content/60">- {{ proyecto.nombre }}</span>
        </h1>
      </div>

      <!-- Selector de Vistas Global -->
      <div class="join bg-base-200 p-1 rounded-lg">
        <button 
          class="btn btn-sm join-item border-none" 
          :class="vistaActiva === 'lista' ? 'bg-base-100 shadow-sm' : 'bg-transparent hover:bg-base-300'"
          @click="vistaActiva = 'lista'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Lista
        </button>
        <button 
          class="btn btn-sm join-item border-none" 
          :class="vistaActiva === 'calendario' ? 'bg-base-100 shadow-sm' : 'bg-transparent hover:bg-base-300'"
          @click="vistaActiva = 'calendario'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendario
        </button>
      </div>
    </div>

    <!-- Cabecera exclusiva para la vista Lista (Semanal) -->
    <ChecklistHeader
      v-if="vistaActiva === 'lista'"
      :rango-texto="rangoTexto"
      @anterior="semanaAnterior"
      @siguiente="semanaSiguiente"
      @ir-a-mes="irAMes"
    />

    <div v-if="cargando" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-show="!cargando">
      <ChecklistVistaLista 
        v-show="vistaActiva === 'lista'" 
        :semana="semana" 
        :colaboradores="colaboradores"
        :puede-editar="puede('editar_checklist')"
        @iniciar-marcado="iniciarMarcado"
        @desmarcar="alDesmarcar"
        @quitar-tarea="alQuitarTarea"
      />
      
      <ChecklistVistaCalendario 
        v-if="vistaActiva === 'calendario'" 
        :eventos="eventosMes" 
        :puede-editar="puede('editar_checklist')"
        @cambiar-mes="refrescarMes"
        @iniciar-marcado="iniciarMarcado"
        @desmarcar="alDesmarcar"
      />
    </div>

    <!-- Modal para foto -->
    <FotoModal
      v-if="mostrarModalFoto"
      @confirmar="confirmarFoto"
      @cancelar="mostrarModalFoto = false; tareaActivaParaFoto = null"
    />
  </div>
</template>
