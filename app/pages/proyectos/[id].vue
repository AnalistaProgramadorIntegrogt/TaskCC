<script setup>
import ProyectoGestionTareas from '~/components/proyecto/ProyectoGestionTareas.vue'
import ProyectoAsignacionTareas from '~/components/proyecto/ProyectoAsignacionTareas.vue'
import ChecklistFotoModal from '~/components/checklist/FotoModal.vue'

const route = useRoute()
const proyectoId = Number(route.params.id)

const { dias, rangoTexto, semanaSiguiente, semanaAnterior, irAMes } = useSemanaUTC6()
const { puede } = usePermisos()
const {
  obtenerChecklistsProyecto,
  crearProyectoChecklist,
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
const colaboradores = ref([])
const colaboradorSeleccionadoId = ref('todos')
const cargando = ref(false)
const tabPrincipal = ref('checklists') // 'checklists' | 'asignacion' | 'tareas_grupos'
const vistaActiva = ref('lista') // 'lista' o 'calendario'
const mostrarModalFoto = ref(false)
const tareaActivaParaFoto = ref(null)

// Múltiples Checklists del Proyecto
const checklistsProyecto = ref([])
const checklistSeleccionadoId = ref('todos') // 'todos' o ID numérico
const modalNuevoChecklistOpen = ref(false)
const guardandoNuevoChecklist = ref(false)
const gruposDelProyecto = ref([])
const nuevoChecklistForm = ref({
  nombre: '',
  descripcion: '',
  color: '#3b82f6',
  gruposIds: []
})

const coloresDisponibles = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#6366f1'  // indigo
]

async function cargarProyecto() {
  const { data } = await supabase.from('proyectos').select('*').eq('id', proyectoId).single()
  proyecto.value = data
}

async function cargarColaboradores() {
  const { data } = await supabase
    .from('colaboradores')
    .select('id, nombre')
    .order('nombre', { ascending: true })
  colaboradores.value = data || []
}

async function cargarChecklists() {
  try {
    checklistsProyecto.value = await obtenerChecklistsProyecto(proyectoId)
  } catch (err) {
    console.error('Error al cargar checklists del proyecto:', err)
  }
}

async function cargarGruposParaModal() {
  const { data } = await supabase
    .from('grupos')
    .select('id, nombre, descripcion')
    .or(`proyecto_id.eq.${proyectoId},proyecto_id.is.null`)
    .order('nombre', { ascending: true })
  gruposDelProyecto.value = data || []
}

const checklistActualNombre = computed(() => {
  if (checklistSeleccionadoId.value === 'todos') {
    return 'Checklists Operativos'
  }
  const chk = checklistsProyecto.value.find(c => c.id === checklistSeleccionadoId.value)
  return chk ? chk.nombre : 'Checklist'
})

const checklistActualColor = computed(() => {
  if (checklistSeleccionadoId.value === 'todos') return null
  const chk = checklistsProyecto.value.find(c => c.id === checklistSeleccionadoId.value)
  return chk?.color || '#3b82f6'
})

const rangoMesCargado = ref({ inicio: null, fin: null })

function seleccionarChecklist(id) {
  checklistSeleccionadoId.value = id
  tabPrincipal.value = 'checklists'
  refrescarSemana()
  if (vistaActiva.value === 'calendario') {
    refrescarMes()
  }
}

function abrirModalNuevoChecklist() {
  nuevoChecklistForm.value = {
    nombre: '',
    descripcion: '',
    color: '#3b82f6',
    gruposIds: []
  }
  cargarGruposParaModal()
  modalNuevoChecklistOpen.value = true
}

async function guardarNuevoChecklist() {
  if (!nuevoChecklistForm.value.nombre.trim()) return
  guardandoNuevoChecklist.value = true
  try {
    const nuevo = await crearProyectoChecklist(proyectoId, nuevoChecklistForm.value)
    await cargarChecklists()
    checklistSeleccionadoId.value = nuevo.id
    modalNuevoChecklistOpen.value = false
    tabPrincipal.value = 'checklists'
    await refrescarSemana()
    if (vistaActiva.value === 'calendario') {
      await refrescarMes()
    }
  } catch (err) {
    console.error('Error al crear nuevo checklist:', err)
    alert(err.message || 'Error al crear el checklist')
  } finally {
    guardandoNuevoChecklist.value = false
  }
}

const colaboradoresFiltrados = computed(() => {
  if (!colaboradorSeleccionadoId.value || colaboradorSeleccionadoId.value === 'todos') {
    return colaboradores.value
  }
  const idNum = Number(colaboradorSeleccionadoId.value)
  return colaboradores.value.filter(c => c.id === idNum)
})

const semanaFiltrada = computed(() => {
  if (!colaboradorSeleccionadoId.value || colaboradorSeleccionadoId.value === 'todos') {
    return semana.value
  }
  const idNum = Number(colaboradorSeleccionadoId.value)
  return semana.value.map(dia => ({
    ...dia,
    tareas: (dia.tareas || []).filter(t => t.colaboradorId === idNum)
  }))
})

const eventosMesFiltrados = computed(() => {
  if (!colaboradorSeleccionadoId.value || colaboradorSeleccionadoId.value === 'todos') {
    return eventosMes.value
  }
  const idNum = Number(colaboradorSeleccionadoId.value)
  return eventosMes.value.filter(e => e.colaboradorId === idNum)
})

const tieneTareasEnSemana = computed(() => {
  if (!semanaFiltrada.value || !semanaFiltrada.value.length) return false
  return semanaFiltrada.value.some(dia => dia.tareas && dia.tareas.length > 0)
})

async function refrescarSemana() {
  if (vistaActiva.value !== 'lista') return
  cargando.value = true
  try {
    semana.value = await cargarSemanaProyecto(proyectoId, dias.value, checklistSeleccionadoId.value)
  } finally {
    cargando.value = false
  }
}

async function refrescarMes(inicio = null, fin = null) {
  let fInicio = inicio
  let fFin = fin

  if (fInicio && fFin) {
    fInicio = typeof fInicio === 'string' ? fInicio : (fInicio.toISOString ? fInicio.toISOString().split('T')[0] : String(fInicio))
    fFin = typeof fFin === 'string' ? fFin : (fFin.toISOString ? fFin.toISOString().split('T')[0] : String(fFin))
    rangoMesCargado.value = { inicio: fInicio, fin: fFin }
  } else if (rangoMesCargado.value.inicio && rangoMesCargado.value.fin) {
    fInicio = rangoMesCargado.value.inicio
    fFin = rangoMesCargado.value.fin
  } else {
    const hoy = new Date()
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const ultimoDia = new Date(anio, hoy.getMonth() + 1, 0).getDate()
    fInicio = `${anio}-${mes}-01`
    fFin = `${anio}-${mes}-${ultimoDia}`
    rangoMesCargado.value = { inicio: fInicio, fin: fFin }
  }

  cargando.value = true
  try {
    eventosMes.value = await cargarRangoProyecto(proyectoId, fInicio, fFin, checklistSeleccionadoId.value)
  } catch (err) {
    console.error('Error al cargar rango del calendario:', err)
  } finally {
    cargando.value = false
  }
}

function actualizarTareaEnSemana(tareaId, actualizacion) {
  for (const dia of semana.value) {
    const idx = dia.tareas?.findIndex(t => t.id === tareaId)
    if (idx !== -1 && idx !== undefined) {
      dia.tareas[idx] = { ...dia.tareas[idx], ...actualizacion }
      break
    }
  }
  
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
  for (const dia of semana.value) {
    if (dia.tareas) {
      dia.tareas = dia.tareas.filter(t => t.id !== tareaId)
    }
  }
  eventosMes.value = eventosMes.value.filter(t => t.id !== tareaId)
}

async function alCompletarAsignacion() {
  await Promise.all([
    refrescarSemana(),
    refrescarMes()
  ])
}

watch([dias], refrescarSemana)
watch(vistaActiva, (nuevaVista) => {
  if (nuevaVista === 'lista') {
    refrescarSemana()
  } else if (nuevaVista === 'calendario') {
    refrescarMes()
  }
})
watch(tabPrincipal, (nuevoTab) => {
  if (nuevoTab === 'checklists') {
    if (vistaActiva.value === 'lista') {
      refrescarSemana()
    } else {
      refrescarMes()
    }
  }
})
watch(checklistSeleccionadoId, () => {
  if (vistaActiva.value === 'lista') {
    refrescarSemana()
  } else if (vistaActiva.value === 'calendario') {
    refrescarMes()
  }
})

onMounted(async () => {
  await Promise.all([
    cargarProyecto(),
    cargarColaboradores(),
    cargarChecklists(),
    refrescarSemana(),
    refrescarMes()
  ])
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 p-4">
    <!-- Encabezado de Navegación del Proyecto -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-200 pb-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/proyectos" class="btn btn-ghost btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Proyectos
        </NuxtLink>
        <h1 class="text-2xl font-extrabold text-base-content">
          <span v-if="proyecto">{{ proyecto.nombre }}</span>
          <span v-else>Cargando proyecto...</span>
        </h1>
      </div>

      <!-- Tabs Principales: Dropdown Checklists vs Asignación Semanal vs Tareas & Grupos -->
      <div class="flex flex-wrap items-center bg-base-200 p-1 rounded-xl gap-1">
        
        <!-- BOTÓN DESPLEGABLE: CHECKLISTS DEL PROYECTO + NUEVO CHECKLIST -->
        <div class="dropdown">
          <div 
            tabindex="0" 
            role="button" 
            class="btn btn-sm border-none gap-2 font-bold cursor-pointer"
            :class="tabPrincipal === 'checklists' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/70 hover:bg-base-300'"
            @click="tabPrincipal = 'checklists'"
          >
            <span v-if="checklistActualColor" class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: checklistActualColor }"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="max-w-[140px] sm:max-w-[190px] truncate">
              {{ checklistActualNombre }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 opacity-60 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Menú desplegable con lista de checklists y botón "Nuevo checklist" -->
          <ul tabindex="0" class="dropdown-content z-30 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-80 border border-base-200 mt-2 space-y-1">
            <li class="menu-title text-[10px] uppercase font-extrabold tracking-wider text-base-content/50 px-2 py-1 flex justify-between items-center">
              <span>Checklists del Proyecto ({{ checklistsProyecto.length }})</span>
            </li>
            
            <li>
              <a 
                class="text-xs font-semibold py-2.5 flex items-center justify-between rounded-xl"
                :class="checklistSeleccionadoId === 'todos' ? 'active bg-primary/10 text-primary font-bold' : ''"
                @click="seleccionarChecklist('todos')"
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm">🌐</span>
                  <span>Todos los checklists</span>
                </div>
                <span v-if="checklistSeleccionadoId === 'todos'" class="text-xs font-bold">✓</span>
              </a>
            </li>

            <div class="divider my-0.5 opacity-60"></div>

            <li v-for="chk in checklistsProyecto" :key="chk.id">
              <a 
                class="text-xs font-semibold py-2.5 flex items-center justify-between rounded-xl"
                :class="checklistSeleccionadoId === chk.id ? 'active bg-primary/10 text-primary font-bold' : ''"
                @click="seleccionarChecklist(chk.id)"
              >
                <div class="flex items-center gap-2.5 truncate">
                  <span class="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" :style="{ backgroundColor: chk.color || '#3b82f6' }"></span>
                  <div class="truncate">
                    <span class="block truncate font-bold text-xs">{{ chk.nombre }}</span>
                    <span v-if="chk.descripcion" class="block truncate text-[10px] opacity-60 font-normal">{{ chk.descripcion }}</span>
                  </div>
                </div>
                <span v-if="checklistSeleccionadoId === chk.id" class="text-xs font-bold text-primary">✓</span>
              </a>
            </li>

            <div class="divider my-1"></div>

            <!-- Botón al fondo del dropdown: "Nuevo checklist" -->
            <li class="p-1">
              <button 
                type="button"
                class="btn btn-primary btn-sm text-xs font-bold gap-2 w-full justify-center shadow-md rounded-xl"
                @click="abrirModalNuevoChecklist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo checklist
              </button>
            </li>
          </ul>
        </div>
        
        <button 
          class="btn btn-sm border-none gap-2 font-bold"
          :class="tabPrincipal === 'asignacion' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/70 hover:bg-base-300'"
          @click="tabPrincipal = 'asignacion'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Asignación Semanal
        </button>

        <button 
          class="btn btn-sm border-none gap-2 font-bold"
          :class="tabPrincipal === 'tareas_grupos' ? 'bg-base-100 shadow-sm text-primary' : 'bg-transparent text-base-content/70 hover:bg-base-300'"
          @click="tabPrincipal = 'tareas_grupos'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Tareas & Grupos
        </button>
      </div>
    </div>

    <!-- Pestaña 1: Checklists Operativos -->
    <div v-if="tabPrincipal === 'checklists'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Selector de Trabajador -->
          <div class="flex items-center gap-2 bg-base-100 px-3 py-1.5 rounded-lg border border-base-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-xs font-semibold text-base-content/70 whitespace-nowrap">Trabajador:</span>
            <select
              v-model="colaboradorSeleccionadoId"
              class="select select-ghost select-xs font-medium focus:outline-none max-w-[200px]"
            >
              <option value="todos">👥 Todos los trabajadores</option>
              <option v-for="c in colaboradores" :key="c.id" :value="c.id">
                👤 {{ c.nombre }}
              </option>
            </select>
          </div>

          <!-- Indicador de Checklist Activo -->
          <div v-if="checklistSeleccionadoId !== 'todos'" class="badge badge-sm py-3 px-3 gap-1.5 font-bold border-none" :style="{ backgroundColor: (checklistActualColor || '#3b82f6') + '20', color: checklistActualColor || '#3b82f6' }">
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: checklistActualColor || '#3b82f6' }"></span>
            {{ checklistActualNombre }}
          </div>

          <!-- Botón Rápido: Asignar Tareas -->
          <button 
            class="btn btn-primary btn-sm gap-1.5 shadow-sm text-xs"
            @click="tabPrincipal = 'asignacion'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Asignar Tareas
          </button>
        </div>

        <!-- Selector de Vistas Global (Lista / Calendario) -->
        <div class="join bg-base-200 p-1 rounded-lg">
          <button 
            class="btn btn-sm join-item border-none" 
            :class="vistaActiva === 'lista' ? 'bg-base-100 shadow-sm font-semibold' : 'bg-transparent hover:bg-base-300'"
            @click="vistaActiva = 'lista'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Lista
          </button>
          <button 
            class="btn btn-sm join-item border-none" 
            :class="vistaActiva === 'calendario' ? 'bg-base-100 shadow-sm font-semibold' : 'bg-transparent hover:bg-base-300'"
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
        <span class="loading loading-spinner loading-lg text-primary" />
      </div>

      <div v-show="!cargando">
        <div v-if="!tieneTareasEnSemana && vistaActiva === 'lista'" class="alert bg-base-100 border border-base-200 p-8 text-center flex flex-col items-center shadow-sm my-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="font-bold text-base text-base-content">No hay tareas programadas para esta semana</span>
          <p class="text-xs text-base-content/60 max-w-md mt-1 mb-4">
            Puedes asignar grupos enteros, partes de un grupo o tareas individuales a los empleados desde la pestaña de Asignación Semanal.
          </p>
          <div class="flex gap-2">
            <button class="btn btn-primary btn-sm gap-2" @click="tabPrincipal = 'asignacion'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Asignar Tareas Semanales
            </button>
            <button class="btn btn-ghost btn-sm gap-2" @click="tabPrincipal = 'tareas_grupos'">
              Gestionar Catálogo
            </button>
          </div>
        </div>

        <ChecklistVistaLista 
          v-show="vistaActiva === 'lista'" 
          :semana="semanaFiltrada" 
          :colaboradores="colaboradoresFiltrados"
          :puede-editar="puede('editar_checklist')"
          @iniciar-marcado="iniciarMarcado"
          @desmarcar="alDesmarcar"
          @quitar-tarea="alQuitarTarea"
        />
        
        <ChecklistVistaCalendario 
          v-if="vistaActiva === 'calendario'" 
          :eventos="eventosMesFiltrados" 
          :colaboradores="colaboradores"
          :colaborador-seleccionado-id="colaboradorSeleccionadoId"
          :puede-editar="puede('editar_checklist')"
          @update:colaborador-seleccionado-id="(val) => colaboradorSeleccionadoId = val"
          @update:colaboradorSeleccionadoId="(val) => colaboradorSeleccionadoId = val"
          @cambiar-mes="refrescarMes"
          @iniciar-marcado="iniciarMarcado"
          @desmarcar="alDesmarcar"
          @abrir-asignacion="tabPrincipal = 'asignacion'"
        />
      </div>

      <!-- Modal para foto -->
      <ChecklistFotoModal
        v-if="mostrarModalFoto"
        @confirmar="confirmarFoto"
        @cancelar="mostrarModalFoto = false; tareaActivaParaFoto = null"
      />
    </div>

    <!-- Pestaña 2: Asignación Semanal de Tareas -->
    <ProyectoAsignacionTareas 
      v-else-if="tabPrincipal === 'asignacion'" 
      :proyecto-id="proyectoId" 
      :checklists-proyecto="checklistsProyecto"
      v-model:checklist-id-inicial="checklistSeleccionadoId"
      @asignacion-completada="alCompletarAsignacion"
    />

    <!-- Pestaña 3: Tareas y Grupos del Proyecto -->
    <ProyectoGestionTareas v-else-if="tabPrincipal === 'tareas_grupos'" :proyecto-id="proyectoId" />

    <!-- MODAL: CREAR NUEVO CHECKLIST PARA EL PROYECTO -->
    <dialog id="modal_crear_nuevo_checklist" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': modalNuevoChecklistOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-2xl border border-base-200 max-w-xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-lg text-base-content">Crear Nuevo Checklist</h3>
            <p class="text-xs text-base-content/60">Define una nueva lista de verificación para este proyecto.</p>
          </div>
        </div>

        <form @submit.prevent="guardarNuevoChecklist" class="space-y-4">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-bold text-xs">Nombre del Checklist <span class="text-error">*</span></span></label>
            <input 
              type="text" 
              v-model="nuevoChecklistForm.nombre" 
              placeholder="Ej. Checklist de Apertura, Limpieza Semanal, Seguridad..." 
              class="input input-bordered input-sm w-full focus:input-primary" 
              required 
            />
          </div>

          <div class="form-control">
            <label class="label py-1"><span class="label-text font-bold text-xs">Descripción (Opcional)</span></label>
            <textarea 
              v-model="nuevoChecklistForm.descripcion" 
              placeholder="Describe el objetivo y alcance de este checklist..." 
              class="textarea textarea-bordered textarea-sm w-full resize-none focus:textarea-primary"
            ></textarea>
          </div>

          <!-- Color distintivo -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-bold text-xs">Color Identificador</span></label>
            <div class="flex items-center gap-2">
              <button 
                v-for="col in coloresDisponibles" 
                :key="col"
                type="button"
                class="w-7 h-7 rounded-full border-2 transition-transform cursor-pointer"
                :class="nuevoChecklistForm.color === col ? 'scale-110 border-base-content shadow-sm ring-2 ring-primary/40' : 'border-transparent hover:scale-105'"
                :style="{ backgroundColor: col }"
                @click="nuevoChecklistForm.color = col"
              />
            </div>
          </div>

          <!-- Grupos de tareas asociados (opcional) -->
          <div class="form-control" v-if="gruposDelProyecto.length > 0">
            <label class="label py-1 justify-between">
              <span class="label-text font-bold text-xs">Asociar Grupos de Tareas (Opcional)</span>
              <span class="label-text-alt text-[10px] text-primary">{{ nuevoChecklistForm.gruposIds.length }} seleccionados</span>
            </label>
            <div class="bg-base-200/50 p-2.5 rounded-xl border border-base-200 max-h-36 overflow-y-auto space-y-1.5">
              <label 
                v-for="g in gruposDelProyecto" 
                :key="g.id"
                class="flex items-center gap-2 p-2 rounded-lg bg-base-100 hover:bg-base-200 cursor-pointer border border-base-200/60 transition-colors"
              >
                <input 
                  type="checkbox" 
                  :value="g.id" 
                  v-model="nuevoChecklistForm.gruposIds" 
                  class="checkbox checkbox-primary checkbox-xs" 
                />
                <span class="text-xs font-medium text-base-content truncate">{{ g.nombre }}</span>
              </label>
            </div>
          </div>

          <div class="modal-action pt-2 border-t border-base-200">
            <button type="button" class="btn btn-ghost btn-sm" @click="modalNuevoChecklistOpen = false" :disabled="guardandoNuevoChecklist">Cancelar</button>
            <button type="submit" class="btn btn-primary btn-sm px-6 font-bold" :disabled="guardandoNuevoChecklist">
              <span v-if="guardandoNuevoChecklist" class="loading loading-spinner loading-xs"></span>
              Crear Checklist
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="modalNuevoChecklistOpen = false"><button>close</button></form>
    </dialog>
  </div>
</template>
