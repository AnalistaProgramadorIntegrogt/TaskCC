<script setup>
const { dias, rangoTexto, semanaSiguiente, semanaAnterior, irAMes } = useSemanaUTC6()
const { puede } = usePermisos()
const {
  cargarSemana,
  cargarGrupoPredeterminado,
  agregarTareaSuelta,
  quitarTarea,
  marcarComoHecha,
  desmarcarTarea,
} = useChecklistData()

const supabase = useSupabaseClient()

const colaboradores = ref([])
const colaboradorId = ref(null)
const tareasDisponibles = ref([])
const semana = ref([])
const cargando = ref(false)

async function cargarColaboradores() {
  const { data } = await supabase.from('colaboradores').select('id, nombre').is('fecha_baja', null)
  colaboradores.value = data || []
}

async function cargarTareasDisponibles() {
  const { data } = await supabase.from('tareas').select('id, nombre').eq('activa', true).order('nombre')
  tareasDisponibles.value = data || []
}

async function refrescarSemana() {
  if (!colaboradorId.value) {
    semana.value = []
    return
  }
  cargando.value = true
  try {
    semana.value = await cargarSemana(colaboradorId.value, dias.value)
  } finally {
    cargando.value = false
  }
}

function encontrarIndiceTarea(index, tareaId) {
  return semana.value[index]?.tareas.findIndex(t => t.id === tareaId) ?? -1
}

async function alCargarRecurrentes(index) {
  const dia = semana.value[index]
  const insertadas = await cargarGrupoPredeterminado(dia.checklistId)
  if (insertadas.length) dia.tareas.push(...insertadas)
}

async function alAgregarTarea(index, tareaId) {
  const dia = semana.value[index]
  const nueva = await agregarTareaSuelta(dia.checklistId, tareaId)
  dia.tareas.push(nueva)
}

async function alMarcarHecha(index, tareaId, archivo) {
  const actualizada = await marcarComoHecha(tareaId, archivo, colaboradorId.value)
  const i = encontrarIndiceTarea(index, tareaId)
  if (i !== -1) semana.value[index].tareas[i] = { ...semana.value[index].tareas[i], ...actualizada }
}

async function alDesmarcar(index, tareaId) {
  const actualizada = await desmarcarTarea(tareaId)
  const i = encontrarIndiceTarea(index, tareaId)
  if (i !== -1) semana.value[index].tareas[i] = { ...semana.value[index].tareas[i], ...actualizada }
}

async function alQuitarTarea(index, tareaId) {
  await quitarTarea(tareaId)
  const dia = semana.value[index]
  dia.tareas = dia.tareas.filter(t => t.id !== tareaId)
}

watch([dias, colaboradorId], refrescarSemana)

onMounted(async () => {
  await Promise.all([cargarColaboradores(), cargarTareasDisponibles()])
  await refrescarSemana()
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-4 p-4">
    <h1 class="text-2xl font-bold">Checklist semanal</h1>

    <ChecklistHeader
      :rango-texto="rangoTexto"
      :colaboradores="colaboradores"
      :colaborador-id="colaboradorId"
      @anterior="semanaAnterior"
      @siguiente="semanaSiguiente"
      @ir-a-mes="irAMes"
      @cambiar-colaborador="id => (colaboradorId = id)"
    />

    <div v-if="!colaboradorId" class="alert">
      <span>Selecciona un colaborador para ver su checklist de la semana.</span>
    </div>

    <div v-else-if="cargando" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ChecklistDia
        v-for="(dia, index) in semana"
        :key="dia.fecha"
        :dia="dia"
        :puede-editar="puede('editar_checklist')"
        :tareas-disponibles="tareasDisponibles"
        @marcar-hecha="(tareaId, archivo) => alMarcarHecha(index, tareaId, archivo)"
        @desmarcar="tareaId => alDesmarcar(index, tareaId)"
        @quitar-tarea="tareaId => alQuitarTarea(index, tareaId)"
        @cargar-recurrentes="alCargarRecurrentes(index)"
        @agregar-tarea="tareaId => alAgregarTarea(index, tareaId)"
      />
    </div>
  </div>
</template>
