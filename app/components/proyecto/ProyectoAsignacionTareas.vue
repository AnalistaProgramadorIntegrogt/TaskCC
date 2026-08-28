<template>
  <div class="space-y-6">
    <!-- Encabezado de Navegación y Resumen -->
    <div class="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-base-content">Asignación Semanal de Tareas</h2>
            <p class="text-xs sm:text-sm text-base-content/70">
              Programa tareas por empleado para días específicos de la semana seleccionada.
            </p>
          </div>
        </div>
      </div>

      <!-- Navegación de Semana -->
      <div class="flex items-center gap-2 bg-base-200/80 p-1.5 rounded-xl border border-base-300 shadow-sm">
        <button class="btn btn-ghost btn-sm btn-square" @click="semanaAnterior" title="Semana anterior">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="px-3 text-center">
          <span class="text-xs uppercase font-bold text-primary block tracking-wider">Semana Operativa</span>
          <span class="text-sm font-extrabold text-base-content whitespace-nowrap">{{ rangoTexto }}</span>
        </div>

        <button class="btn btn-ghost btn-sm btn-square" @click="semanaSiguiente" title="Semana siguiente">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button class="btn btn-outline btn-xs ml-1" @click="irAHoy">
          Hoy
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast toast-end toast-bottom z-50">
      <div class="alert" :class="toastType === 'error' ? 'alert-error' : 'alert-success'">
        <span>{{ toastMessage }}</span>
      </div>
    </div>

    <div v-if="cargandoInicial" class="flex justify-center p-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else class="space-y-6">
      <!-- Grid de Configuración de Asignación: Paso 1 y Paso 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Columna Izquierda: Selección de Empleado, Checklist Destino y Días (5 columnas) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Tarjeta 1: Selección de Responsable y Checklist Destino -->
          <div class="bg-base-100 p-5 rounded-2xl shadow-sm border border-base-200 space-y-4">
            <div class="flex items-center justify-between border-b border-base-200 pb-3">
              <h3 class="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2">
                <span class="badge badge-primary badge-sm font-bold">1</span>
                Responsable & Checklist
              </h3>
              
              <!-- Modo Asignación Múltiple Toggle -->
              <label class="label cursor-pointer gap-2 p-0">
                <span class="label-text text-xs text-base-content/60">Varios responsables</span>
                <input type="checkbox" v-model="modoVariosColaboradores" class="toggle toggle-primary toggle-xs" />
              </label>
            </div>

            <!-- Selector de Checklist Destino -->
            <div class="space-y-1.5" v-if="checklistsDisponibles.length > 0">
              <label class="text-xs font-semibold text-base-content/70 flex items-center justify-between">
                <span>Checklist Destino:</span>
                <span class="text-[10px] text-primary font-bold">¿A cuál lista pertenece?</span>
              </label>
              <select v-model="checklistDestinoId" class="select select-bordered select-sm w-full font-medium">
                <option v-for="chk in checklistsDisponibles" :key="chk.id" :value="chk.id">
                  📋 {{ chk.nombre }}
                </option>
              </select>
            </div>

            <!-- Modo 1: Solo un responsable -->
            <div v-if="!modoVariosColaboradores" class="space-y-2">
              <label class="text-xs font-semibold text-base-content/70">Selecciona el responsable:</label>
              <select v-model="colaboradorId" class="select select-bordered select-sm w-full font-medium">
                <option :value="null" disabled>-- Selecciona un responsable --</option>
                <option v-for="c in colaboradores" :key="c.id" :value="c.id">
                  👤 {{ c.nombre }} {{ c.email ? `(${c.email})` : '' }}
                </option>
              </select>

              <!-- Tarjeta preview del colaborador responsable seleccionado -->
              <div v-if="colaboradorActual" class="p-3 bg-base-200/50 rounded-xl border border-base-200 flex items-center justify-between mt-2">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-xs"
                    :style="{ backgroundColor: getColaboradorColor(colaboradorActual.id) }"
                  >
                    {{ getInitials(colaboradorActual.nombre) }}
                  </div>
                  <div>
                    <div class="font-bold text-xs text-base-content">{{ colaboradorActual.nombre }}</div>
                    <div class="text-[10px] text-base-content/60">{{ colaboradorActual.roles?.rol || 'Colaborador' }} (Responsable)</div>
                  </div>
                </div>
                <div class="badge badge-sm badge-outline">
                  {{ totalTareasAsignadasColaborador }} tareas como responsable
                </div>
              </div>
            </div>

            <!-- Modo 2: Múltiples responsables -->
            <div v-else class="space-y-2">
              <div class="flex justify-between items-center text-xs">
                <span class="font-semibold text-base-content/70">Selecciona los responsables:</span>
                <div class="space-x-1">
                  <button class="btn btn-ghost btn-xs text-[10px]" @click="seleccionarTodosColaboradores">Todos</button>
                  <button class="btn btn-ghost btn-xs text-[10px]" @click="deseleccionarTodosColaboradores">Ninguno</button>
                </div>
              </div>

              <div class="max-h-40 overflow-y-auto space-y-1.5 p-1 bg-base-200/40 rounded-xl border border-base-200">
                <label 
                  v-for="c in colaboradores" 
                  :key="c.id"
                  class="flex items-center gap-2 p-2 rounded-lg bg-base-100 hover:bg-base-300/60 cursor-pointer border border-base-200/70 transition-colors"
                >
                  <input type="checkbox" :value="c.id" v-model="colaboradoresSeleccionadosIds" class="checkbox checkbox-primary checkbox-xs" />
                  <span 
                    class="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    :style="{ backgroundColor: getColaboradorColor(c.id) }"
                  ></span>
                  <span class="text-xs font-medium text-base-content truncate">{{ c.nombre }}</span>
                </label>
              </div>

              <div class="text-[11px] text-primary font-bold">
                {{ colaboradoresSeleccionadosIds.length }} responsable(s) seleccionado(s)
              </div>
            </div>
            
            <p class="text-[11px] text-base-content/50 italic">
              ℹ️ Cada tarea tendrá su responsable asignado, pero cualquier colaborador del proyecto podrá verla y completarla.
            </p>
          </div>

          <!-- Tarjeta 2: Selección de Días de la Semana -->
          <div class="bg-base-100 p-5 rounded-2xl shadow-sm border border-base-200 space-y-4">
            <div class="flex items-center justify-between border-b border-base-200 pb-3">
              <h3 class="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2">
                <span class="badge badge-primary badge-sm font-bold">2</span>
                Días de la Semana
              </h3>
              <span class="text-xs font-bold text-primary">{{ fechasSeleccionadas.length }} días elegidos</span>
            </div>

            <!-- Accesos rápidos de selección -->
            <div class="flex flex-wrap gap-1.5">
              <button 
                type="button" 
                class="btn btn-xs rounded-lg"
                :class="esTodaLaSemana ? 'btn-primary' : 'btn-ghost bg-base-200'"
                @click="seleccionarTodaLaSemana"
              >
                ✨ Toda la semana
              </button>
              <button 
                type="button" 
                class="btn btn-xs rounded-lg"
                :class="esDiasLaborales ? 'btn-primary' : 'btn-ghost bg-base-200'"
                @click="seleccionarDiasLaborales"
              >
                💼 Lun - Vie
              </button>
              <button 
                type="button" 
                class="btn btn-xs rounded-lg"
                :class="esFinDeSemana ? 'btn-primary' : 'btn-ghost bg-base-200'"
                @click="seleccionarFinDeSemana"
              >
                🏖️ Sáb - Dom
              </button>
              <button 
                type="button" 
                class="btn btn-ghost btn-xs text-error"
                @click="fechasSeleccionadas = []"
                v-if="fechasSeleccionadas.length > 0"
              >
                Limpiar
              </button>
            </div>

            <!-- Chips de días de la semana -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label 
                v-for="dia in dias" 
                :key="dia.fecha"
                class="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all"
                :class="fechasSeleccionadas.includes(dia.fecha) 
                  ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs' 
                  : 'bg-base-200/50 border-base-200 hover:bg-base-200 text-base-content/80'"
              >
                <div class="flex items-center gap-2.5">
                  <input 
                    type="checkbox" 
                    :value="dia.fecha" 
                    v-model="fechasSeleccionadas" 
                    class="checkbox checkbox-primary checkbox-xs" 
                  />
                  <div>
                    <div class="text-xs leading-none">{{ dia.dia }}</div>
                    <div class="text-[10px] opacity-60 font-normal mt-0.5">{{ formatearFechaCorta(dia.fecha) }}</div>
                  </div>
                </div>
                <span v-if="dia.esHoy" class="badge badge-accent badge-xs font-bold text-[9px]">HOY</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Selección de Tareas (3 Modos) (7 columnas) -->
        <div class="lg:col-span-7 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-3">
              <h3 class="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-2">
                <span class="badge badge-primary badge-sm font-bold">3</span>
                Seleccionar Tareas a Asignar
              </h3>
              <span class="text-xs text-base-content/60">Elige cómo deseas asignar</span>
            </div>

            <!-- Tabs de Modo de Asignación -->
            <div class="grid grid-cols-3 gap-2 bg-base-200 p-1 rounded-xl">
              <button 
                type="button"
                class="btn btn-sm border-none text-xs font-bold transition-all"
                :class="modoAsignacion === 'grupo_completo' ? 'bg-base-100 text-primary shadow-xs' : 'bg-transparent text-base-content/70 hover:bg-base-300'"
                @click="modoAsignacion = 'grupo_completo'"
              >
                📁 Grupo Completo
              </button>
              <button 
                type="button"
                class="btn btn-sm border-none text-xs font-bold transition-all"
                :class="modoAsignacion === 'seleccionar_grupo' ? 'bg-base-100 text-primary shadow-xs' : 'bg-transparent text-base-content/70 hover:bg-base-300'"
                @click="modoAsignacion = 'seleccionar_grupo'"
              >
                📝 De un Grupo
              </button>
              <button 
                type="button"
                class="btn btn-sm border-none text-xs font-bold transition-all"
                :class="modoAsignacion === 'individual' ? 'bg-base-100 text-primary shadow-xs' : 'bg-transparent text-base-content/70 hover:bg-base-300'"
                @click="modoAsignacion = 'individual'"
              >
                ⚡ Tarea Individual
              </button>
            </div>

            <!-- MODO 1: GRUPO COMPLETO -->
            <div v-if="modoAsignacion === 'grupo_completo'" class="space-y-4">
              <p class="text-xs text-base-content/70">
                Selecciona un grupo para asignar <strong>todas sus tareas</strong> a los días y colaboradores seleccionados:
              </p>

              <div v-if="todosLosGruposDisponibles.length === 0" class="alert bg-base-200 border border-base-300 text-xs text-center p-4">
                No hay grupos configurados para este proyecto ni plantillas globales. Crea uno en la pestaña de "Tareas & Grupos".
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                <div 
                  v-for="g in todosLosGruposDisponibles" 
                  :key="g.id"
                  class="p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer"
                  :class="grupoSeleccionadoId === g.id 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-base-200 bg-base-200/30 hover:border-base-300 hover:bg-base-200/60'"
                  @click="grupoSeleccionadoId = g.id"
                >
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span v-if="g.proyecto_id" class="badge badge-primary badge-xs">Proyecto</span>
                      <span v-else class="badge badge-accent badge-xs">⭐ Global</span>
                      <span class="text-[11px] font-bold text-base-content/60">
                        {{ getTareasDelGrupo(g.id).length }} tareas
                      </span>
                    </div>
                    <h4 class="font-bold text-sm text-base-content leading-tight">{{ g.nombre }}</h4>
                    <p class="text-[11px] text-base-content/60 line-clamp-2 mt-1">{{ g.descripcion || 'Sin descripción' }}</p>

                    <!-- Preview de Tareas -->
                    <div class="mt-3 pt-2 border-t border-base-200/80 space-y-1">
                      <div 
                        v-for="t in getTareasDelGrupo(g.id).slice(0, 3)" 
                        :key="t.id"
                        class="text-[10px] text-base-content/80 truncate flex items-center gap-1"
                      >
                        <span class="text-primary">•</span> {{ t.nombre }}
                      </div>
                      <div v-if="getTareasDelGrupo(g.id).length > 3" class="text-[9px] text-primary font-semibold">
                        + {{ getTareasDelGrupo(g.id).length - 3 }} tareas más
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 pt-2 border-t border-base-200 flex items-center justify-between">
                    <input 
                      type="radio" 
                      name="grupo_completo_radio" 
                      :value="g.id" 
                      v-model="grupoSeleccionadoId" 
                      class="radio radio-primary radio-xs" 
                    />
                    <span class="text-[11px] font-bold" :class="grupoSeleccionadoId === g.id ? 'text-primary' : 'text-base-content/60'">
                      {{ grupoSeleccionadoId === g.id ? 'Seleccionado' : 'Elegir' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- MODO 2: SELECCIONAR DE UN GRUPO -->
            <div v-else-if="modoAsignacion === 'seleccionar_grupo'" class="space-y-4">
              <div class="form-control">
                <label class="label py-1"><span class="label-text text-xs font-bold">1. Elige el grupo:</span></label>
                <select v-model="grupoSeleccionadoId" class="select select-bordered select-sm w-full">
                  <option :value="null" disabled>-- Selecciona un grupo --</option>
                  <option v-for="g in todosLosGruposDisponibles" :key="g.id" :value="g.id">
                    {{ g.proyecto_id ? '📁' : '⭐' }} {{ g.nombre }} ({{ getTareasDelGrupo(g.id).length }} tareas)
                  </option>
                </select>
              </div>

              <div v-if="grupoSeleccionadoId" class="space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold text-base-content/80">2. Marca las tareas que deseas asignar:</span>
                  <div class="space-x-1">
                    <button class="btn btn-ghost btn-xs text-[10px]" @click="seleccionarTodasTareasDelGrupo">Todas</button>
                    <button class="btn btn-ghost btn-xs text-[10px]" @click="tareasSeleccionadasIds = []">Ninguna</button>
                  </div>
                </div>

                <div v-if="tareasDelGrupoActual.length === 0" class="text-xs italic text-base-content/50 py-4 text-center">
                  Este grupo no tiene tareas asignadas aún.
                </div>

                <div v-else class="max-h-[260px] overflow-y-auto space-y-1.5 p-1 bg-base-200/40 rounded-xl border border-base-200">
                  <label 
                    v-for="t in tareasDelGrupoActual" 
                    :key="t.id"
                    class="flex items-center justify-between p-2.5 rounded-lg bg-base-100 hover:bg-base-200/60 cursor-pointer border border-base-200 transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        :value="t.id" 
                        v-model="tareasSeleccionadasIds" 
                        class="checkbox checkbox-primary checkbox-xs" 
                      />
                      <div>
                        <span class="text-xs font-bold text-base-content block">{{ t.nombre }}</span>
                        <span v-if="t.descripcion" class="text-[10px] text-base-content/60 line-clamp-1">{{ t.descripcion }}</span>
                      </div>
                    </div>
                  </label>
                </div>

                <div class="text-xs font-bold text-primary">
                  {{ tareasSeleccionadasIds.length }} tarea(s) seleccionada(s) del grupo
                </div>
              </div>
            </div>

            <!-- MODO 3: TAREA INDIVIDUAL / SUELTA -->
            <div v-else-if="modoAsignacion === 'individual'" class="space-y-3">
              <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
                <div class="relative flex-1">
                  <input 
                    type="text" 
                    v-model="busquedaTarea" 
                    placeholder="🔍 Buscar tarea individual en el catálogo..." 
                    class="input input-bordered input-sm w-full pl-8"
                  />
                </div>
                <button class="btn btn-outline btn-sm gap-1 text-xs" @click="abrirModalNuevaTarea">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Tarea
                </button>
              </div>

              <div class="flex justify-between items-center text-xs">
                <span class="font-semibold text-base-content/70">Catálogo de tareas activas:</span>
                <div class="space-x-1">
                  <button class="btn btn-ghost btn-xs text-[10px]" @click="seleccionarTodasTareasFiltradas">Marcar Visibles</button>
                  <button class="btn btn-ghost btn-xs text-[10px]" @click="tareasIndividualesIds = []">Ninguna</button>
                </div>
              </div>

              <div class="max-h-[260px] overflow-y-auto space-y-1.5 p-1 bg-base-200/40 rounded-xl border border-base-200">
                <label 
                  v-for="t in tareasIndividualesFiltradas" 
                  :key="t.id"
                  class="flex items-center justify-between p-2.5 rounded-lg bg-base-100 hover:bg-base-200/60 cursor-pointer border border-base-200 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      :value="t.id" 
                      v-model="tareasIndividualesIds" 
                      class="checkbox checkbox-primary checkbox-xs" 
                    />
                    <div>
                      <span class="text-xs font-bold text-base-content block">{{ t.nombre }}</span>
                      <span v-if="t.descripcion" class="text-[10px] text-base-content/60 line-clamp-1">{{ t.descripcion }}</span>
                    </div>
                  </div>
                </label>

                <div v-if="tareasIndividualesFiltradas.length === 0" class="text-xs text-center py-6 text-base-content/50">
                  No se encontraron tareas con ese nombre.
                </div>
              </div>

              <div class="text-xs font-bold text-primary">
                {{ tareasIndividualesIds.length }} tarea(s) individual(es) seleccionada(s)
              </div>
            </div>
          </div>

          <!-- BOTÓN PRINCIPAL DE EJECUCIÓN DE ASIGNACIÓN -->
          <div class="pt-4 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-base-200/40 p-4 rounded-xl">
            <div class="text-xs text-base-content/70 text-center sm:text-left">
              <span class="font-bold text-base-content block">{{ resumenAsignacionTexto.titulo }}</span>
              <span>{{ resumenAsignacionTexto.detalle }}</span>
            </div>

            <button 
              type="button" 
              class="btn btn-primary btn-md gap-2 w-full sm:w-auto shadow-md font-bold text-sm px-6"
              :disabled="!esValidoParaAsignar || guardando"
              @click="ejecutarAsignacion"
            >
              <span v-if="guardando" class="loading loading-spinner loading-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Confirmar Asignación
            </button>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 4: PREVISUALIZACIÓN Y GESTIÓN EN VIVO DE LA SEMANA -->
      <div class="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-4">
          <div>
            <h3 class="text-lg font-bold text-base-content flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-success inline-block"></span>
              Tareas Asignadas para la Semana
              <span v-if="colaboradorActual" class="text-primary font-normal">({{ colaboradorActual.nombre }})</span>
            </h3>
            <p class="text-xs text-base-content/60 mt-0.5">
              Visualiza y gestiona las tareas ya programadas para cada día de esta semana en este proyecto.
            </p>
          </div>

          <button 
            class="btn btn-ghost btn-xs gap-1"
            @click="cargarAsignacionesSemana"
            :disabled="cargandoAsignaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refrescar
          </button>
        </div>

        <div v-if="cargandoAsignaciones" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md text-primary"></span>
        </div>

        <!-- Grid de los 7 días de la semana con sus tareas asignadas -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          <div 
            v-for="dia in dias" 
            :key="dia.fecha"
            class="bg-base-200/40 rounded-xl p-3 border flex flex-col justify-between min-h-[160px]"
            :class="dia.esHoy ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'border-base-200'"
          >
            <div>
              <!-- Cabecera del Día -->
              <div class="flex items-center justify-between border-b border-base-300 pb-1.5 mb-2">
                <span class="font-extrabold text-xs text-base-content">{{ dia.dia }}</span>
                <span class="text-[10px] text-base-content/60">{{ formatearFechaCorta(dia.fecha) }}</span>
              </div>

              <!-- Lista de Tareas para este día -->
              <div class="space-y-1.5">
                <div 
                  v-for="t in asignacionesPorDia[dia.fecha] || []" 
                  :key="t.id"
                  class="p-2 rounded-lg bg-base-100 border border-base-200 shadow-xs flex items-start justify-between gap-1 group hover:border-primary/40 transition-colors"
                >
                  <div class="min-w-0 flex-1">
                    <div class="text-[11px] font-bold text-base-content leading-tight truncate">
                      {{ t.tarea?.nombre || t.tarea_nombre_snapshot || 'Tarea' }}
                    </div>
                    <div v-if="t.grupo_nombre_snapshot" class="text-[9px] text-primary truncate font-medium">
                      {{ t.grupo_nombre_snapshot }}
                    </div>
                    <div class="mt-0.5">
                      <span v-if="t.completada" class="badge badge-success badge-xs text-[8px] py-0 h-3.5">Hecha</span>
                      <span v-else class="badge badge-ghost badge-xs text-[8px] py-0 h-3.5">Pendiente</span>
                    </div>
                  </div>

                  <!-- Botón Desasignar / Eliminar tarea puntual -->
                  <button 
                    type="button"
                    class="btn btn-ghost btn-xs btn-circle h-5 w-5 min-h-0 text-base-content/40 hover:text-error opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Eliminar tarea asignada"
                    @click="eliminarTareaAsignada(t.id)"
                  >
                    ✕
                  </button>
                </div>

                <div 
                  v-if="!(asignacionesPorDia[dia.fecha]?.length)" 
                  class="text-[11px] text-base-content/40 text-center py-6 italic"
                >
                  Sin tareas
                </div>
              </div>
            </div>

            <!-- Footer del Día con conteo -->
            <div class="mt-2 pt-1.5 border-t border-base-200 text-right">
              <span class="text-[10px] font-semibold text-base-content/50">
                {{ (asignacionesPorDia[dia.fecha] || []).length }} tarea(s)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Rápido: Crear Nueva Tarea -->
    <dialog id="modal_nueva_tarea_asig" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': modalNuevaTareaOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-2xl border border-base-200">
        <h3 class="font-bold text-lg mb-3 text-base-content">Crear Nueva Tarea en Catálogo</h3>
        <form @submit.prevent="guardarNuevaTarea" class="space-y-4">
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-bold text-xs">Nombre <span class="text-error">*</span></span></label>
            <input type="text" v-model="formNuevaTarea.nombre" placeholder="Ej. Limpieza de filtros" class="input input-bordered input-sm w-full" required />
          </div>
          <div class="form-control">
            <label class="label py-1"><span class="label-text font-bold text-xs">Descripción</span></label>
            <textarea v-model="formNuevaTarea.descripcion" placeholder="Instrucciones para la tarea..." class="textarea textarea-bordered textarea-sm w-full resize-none"></textarea>
          </div>
          <div class="modal-action pt-2">
            <button type="button" class="btn btn-ghost btn-sm" @click="modalNuevaTareaOpen = false">Cancelar</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="guardandoNuevaTarea">
              <span v-if="guardandoNuevaTarea" class="loading loading-spinner loading-xs"></span>
              Crear y Seleccionar
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="modalNuevaTareaOpen = false"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getColaboradorColor } from '~/utils/colors'

const props = defineProps<{
  proyectoId: number
  checklistsProyecto?: any[]
  checklistIdInicial?: string | number
}>()

const emit = defineEmits(['asignacion-completada'])

const supabase = useSupabaseClient()
const { dias, rangoTexto, semanaSiguiente, semanaAnterior, ancla } = useSemanaUTC6()
const { asignarTareasSemanal, obtenerAsignacionesSemanaColaborador, quitarTarea, obtenerChecklistsProyecto } = useChecklistData()

// Estados principales
const cargandoInicial = ref(true)
const cargandoAsignaciones = ref(false)
const guardando = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Datos de Catálogos y Checklists
const colaboradores = ref<any[]>([])
const checklistsLocales = ref<any[]>([])
const checklistDestinoId = ref<number | null>(null)

const gruposProyecto = ref<any[]>([])
const gruposDefault = ref<any[]>([])
const catalogTareas = ref<any[]>([])
const tareasRecurrentes = ref<any[]>([])

// Selección de Empleados
const modoVariosColaboradores = ref(false)
const colaboradorId = ref<number | null>(null)
const colaboradoresSeleccionadosIds = ref<number[]>([])

// Selección de Días
const fechasSeleccionadas = ref<string[]>([])

// Modos de Asignación ('grupo_completo' | 'seleccionar_grupo' | 'individual')
const modoAsignacion = ref<'grupo_completo' | 'seleccionar_grupo' | 'individual'>('grupo_completo')

// Selección de Grupo y Tareas
const grupoSeleccionadoId = ref<number | null>(null)
const tareasSeleccionadasIds = ref<number[]>([])
const tareasIndividualesIds = ref<number[]>([])
const busquedaTarea = ref('')

// Asignaciones ya existentes para la semana
const asignacionesPorDia = ref<Record<string, any[]>>({})

// Modal Nueva Tarea
const modalNuevaTareaOpen = ref(false)
const guardandoNuevaTarea = ref(false)
const formNuevaTarea = ref({ nombre: '', descripcion: '' })

// Lifecycle
onMounted(async () => {
  await cargarDatosIniciales()
  seleccionarTodaLaSemana()
})

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => toastMessage.value = '', 4000)
}

const getInitials = (str: string) => {
  if (!str) return 'U'
  return str.substring(0, 2).toUpperCase()
}

const formatearFechaCorta = (fechaStr: string) => {
  if (!fechaStr) return ''
  const partes = fechaStr.split('-')
  if (partes.length < 3) return fechaStr
  return `${partes[2]}/${partes[1]}`
}

function irAHoy() {
  const hoy = new Date()
  const ms = hoy.getTime() - 6 * 60 * 60 * 1000
  ancla.value = new Date(ms)
}

// Carga de catálogos, grupos y checklists
const cargarDatosIniciales = async () => {
  cargandoInicial.value = true
  try {
    const [colabsRes, gProjRes, gDefRes, tRes, trRes, chkData] = await Promise.all([
      supabase.from('colaboradores').select('id, nombre, email, rol_id, roles(rol)').order('nombre', { ascending: true }),
      supabase.from('grupos').select('*').eq('proyecto_id', props.proyectoId).eq('es_predeterminado', false).order('id', { ascending: true }),
      supabase.from('grupos').select('*').or('es_predeterminado.eq.true,proyecto_id.is.null').order('id', { ascending: true }),
      supabase.from('tareas').select('*').eq('activa', true).order('nombre', { ascending: true }),
      supabase.from('tareas_recurrentes').select('*'),
      obtenerChecklistsProyecto(props.proyectoId)
    ])

    colaboradores.value = colabsRes.data || []
    gruposProyecto.value = gProjRes.data || []
    gruposDefault.value = gDefRes.data || []
    catalogTareas.value = tRes.data || []
    tareasRecurrentes.value = trRes.data || []
    checklistsLocales.value = chkData || []

    // Inicializar checklist destino
    if (props.checklistIdInicial && props.checklistIdInicial !== 'todos') {
      checklistDestinoId.value = Number(props.checklistIdInicial)
    } else if (checklistsDisponibles.value.length > 0) {
      checklistDestinoId.value = checklistsDisponibles.value[0].id
    }

    // Seleccionar primer colaborador si existe
    if (colaboradores.value.length > 0 && !colaboradorId.value) {
      colaboradorId.value = colaboradores.value[0].id
    }

    // Seleccionar primer grupo si existe
    if (todosLosGruposDisponibles.value.length > 0) {
      grupoSeleccionadoId.value = todosLosGruposDisponibles.value[0].id
    }

    await cargarAsignacionesSemana()
  } catch (err: any) {
    console.error('Error al cargar datos de asignación:', err)
    showToast('Error al cargar datos del proyecto', 'error')
  } finally {
    cargandoInicial.value = false
  }
}

const checklistsDisponibles = computed(() => {
  if (props.checklistsProyecto && props.checklistsProyecto.length > 0) {
    return props.checklistsProyecto
  }
  return checklistsLocales.value
})

// Grupos combinados (Proyecto + Globales)
const todosLosGruposDisponibles = computed(() => {
  return [...gruposProyecto.value, ...gruposDefault.value]
})

// Colaborador actual en modo individual
const colaboradorActual = computed(() => {
  if (!colaboradorId.value) return null
  return colaboradores.value.find(c => c.id === colaboradorId.value) || null
})

// Tareas asociadas a un grupo
const getTareasDelGrupo = (gId: number) => {
  const tIds = tareasRecurrentes.value.filter(tr => tr.grupo_id === gId).map(tr => tr.tarea_id)
  return catalogTareas.value.filter(t => tIds.includes(t.id))
}

const tareasDelGrupoActual = computed(() => {
  if (!grupoSeleccionadoId.value) return []
  return getTareasDelGrupo(grupoSeleccionadoId.value)
})

// Tareas individuales con filtro
const tareasIndividualesFiltradas = computed(() => {
  if (!busquedaTarea.value.trim()) return catalogTareas.value
  const q = busquedaTarea.value.toLowerCase()
  return catalogTareas.value.filter(t => 
    t.nombre.toLowerCase().includes(q) || 
    (t.descripcion && t.descripcion.toLowerCase().includes(q))
  )
})

// Días de la semana helpers
const esTodaLaSemana = computed(() => {
  return dias.value.length > 0 && dias.value.every(d => fechasSeleccionadas.value.includes(d.fecha))
})

const esDiasLaborales = computed(() => {
  const fechasLaborales = dias.value.slice(0, 5).map(d => d.fecha)
  return fechasLaborales.length === 5 && 
    fechasLaborales.every(f => fechasSeleccionadas.value.includes(f)) && 
    fechasSeleccionadas.value.length === 5
})

const esFinDeSemana = computed(() => {
  const fechasFin = dias.value.slice(5, 7).map(d => d.fecha)
  return fechasFin.length === 2 && 
    fechasFin.every(f => fechasSeleccionadas.value.includes(f)) && 
    fechasSeleccionadas.value.length === 2
})

function seleccionarTodaLaSemana() {
  fechasSeleccionadas.value = dias.value.map(d => d.fecha)
}

function seleccionarDiasLaborales() {
  fechasSeleccionadas.value = dias.value.slice(0, 5).map(d => d.fecha)
}

function seleccionarFinDeSemana() {
  fechasSeleccionadas.value = dias.value.slice(5, 7).map(d => d.fecha)
}

function seleccionarTodosColaboradores() {
  colaboradoresSeleccionadosIds.value = colaboradores.value.map(c => c.id)
}

function deseleccionarTodosColaboradores() {
  colaboradoresSeleccionadosIds.value = []
}

function seleccionarTodasTareasDelGrupo() {
  tareasSeleccionadasIds.value = tareasDelGrupoActual.value.map(t => t.id)
}

function seleccionarTodasTareasFiltradas() {
  tareasIndividualesIds.value = tareasIndividualesFiltradas.value.map(t => t.id)
}

// Cargar asignaciones de la semana para el colaborador activo
const cargarAsignacionesSemana = async () => {
  if (!colaboradorId.value || !dias.value.length) return
  cargandoAsignaciones.value = true
  try {
    const fechas = dias.value.map(d => d.fecha)
    asignacionesPorDia.value = await obtenerAsignacionesSemanaColaborador(props.proyectoId, colaboradorId.value, fechas, checklistDestinoId.value)
  } catch (err) {
    console.error('Error al obtener asignaciones semanales:', err)
  } finally {
    cargandoAsignaciones.value = false
  }
}

const totalTareasAsignadasColaborador = computed(() => {
  let count = 0
  Object.values(asignacionesPorDia.value).forEach(list => {
    count += (list?.length || 0)
  })
  return count
})

// Validación antes de asignar
const esValidoParaAsignar = computed(() => {
  const tieneColabs = modoVariosColaboradores.value 
    ? colaboradoresSeleccionadosIds.value.length > 0 
    : !!colaboradorId.value

  if (!tieneColabs) return false
  if (fechasSeleccionadas.value.length === 0) return false

  if (modoAsignacion.value === 'grupo_completo') {
    return !!grupoSeleccionadoId.value && getTareasDelGrupo(grupoSeleccionadoId.value).length > 0
  }
  if (modoAsignacion.value === 'seleccionar_grupo') {
    return tareasSeleccionadasIds.value.length > 0
  }
  if (modoAsignacion.value === 'individual') {
    return tareasIndividualesIds.value.length > 0
  }

  return false
})

// Resumen del texto de asignación
const resumenAsignacionTexto = computed(() => {
  const colabsCount = modoVariosColaboradores.value 
    ? colaboradoresSeleccionadosIds.value.length 
    : (colaboradorId.value ? 1 : 0)
  
  const diasCount = fechasSeleccionadas.value.length

  let tareasCount = 0
  let detalleModo = ''

  if (modoAsignacion.value === 'grupo_completo' && grupoSeleccionadoId.value) {
    const g = todosLosGruposDisponibles.value.find(x => x.id === grupoSeleccionadoId.value)
    tareasCount = getTareasDelGrupo(grupoSeleccionadoId.value).length
    detalleModo = `Grupo: "${g?.nombre || 'Grupo'}" (${tareasCount} tareas)`
  } else if (modoAsignacion.value === 'seleccionar_grupo') {
    tareasCount = tareasSeleccionadasIds.value.length
    detalleModo = `${tareasCount} tarea(s) seleccionada(s) de grupo`
  } else if (modoAsignacion.value === 'individual') {
    tareasCount = tareasIndividualesIds.value.length
    detalleModo = `${tareasCount} tarea(s) individual(es)`
  }

  return {
    titulo: `Asignando como responsable a ${colabsCount} empleado(s) en ${diasCount} día(s)`,
    detalle: detalleModo || 'Selecciona las tareas a asignar'
  }
})

// Ejecutar Asignación
const ejecutarAsignacion = async () => {
  if (!esValidoParaAsignar.value) return
  guardando.value = true

  try {
    const targetColaboradores = modoVariosColaboradores.value 
      ? colaboradoresSeleccionadosIds.value 
      : (colaboradorId.value ? [colaboradorId.value] : [])

    const items: any[] = []

    if (modoAsignacion.value === 'grupo_completo' && grupoSeleccionadoId.value) {
      const g = todosLosGruposDisponibles.value.find(x => x.id === grupoSeleccionadoId.value)
      const tareasG = getTareasDelGrupo(grupoSeleccionadoId.value)
      tareasG.forEach(t => {
        items.push({
          tareaId: t.id,
          tareaNombre: t.nombre,
          grupoId: g?.id || null,
          grupoNombre: g?.nombre || null
        })
      })
    } else if (modoAsignacion.value === 'seleccionar_grupo' && grupoSeleccionadoId.value) {
      const g = todosLosGruposDisponibles.value.find(x => x.id === grupoSeleccionadoId.value)
      const tareasG = getTareasDelGrupo(grupoSeleccionadoId.value).filter(t => tareasSeleccionadasIds.value.includes(t.id))
      tareasG.forEach(t => {
        items.push({
          tareaId: t.id,
          tareaNombre: t.nombre,
          grupoId: g?.id || null,
          grupoNombre: g?.nombre || null
        })
      })
    } else if (modoAsignacion.value === 'individual') {
      const tareasInd = catalogTareas.value.filter(t => tareasIndividualesIds.value.includes(t.id))
      tareasInd.forEach(t => {
        items.push({
          tareaId: t.id,
          tareaNombre: t.nombre,
          grupoId: null,
          grupoNombre: null
        })
      })
    }

    const insertadas = await asignarTareasSemanal({
      proyectoId: props.proyectoId,
      proyectoChecklistId: checklistDestinoId.value,
      colaboradorIds: targetColaboradores,
      fechas: fechasSeleccionadas.value,
      items
    })

    showToast(`¡Se asignaron exitosamente ${insertadas} tareas con su responsable asignado!`, 'success')

    await cargarAsignacionesSemana()
    emit('asignacion-completada')

  } catch (err: any) {
    console.error('Error al ejecutar asignación:', err)
    showToast(err.message || 'Error al asignar tareas', 'error')
  } finally {
    guardando.value = false
  }
}

// Eliminar / Desasignar tarea puntual
const eliminarTareaAsignada = async (checklistTareaId: number) => {
  try {
    await quitarTarea(checklistTareaId)
    showToast('Tarea desasignada correctamente')
    await cargarAsignacionesSemana()
    emit('asignacion-completada')
  } catch (err: any) {
    showToast(err.message || 'Error al eliminar tarea', 'error')
  }
}

// Modal Nueva Tarea
const abrirModalNuevaTarea = () => {
  formNuevaTarea.value = { nombre: '', descripcion: '' }
  modalNuevaTareaOpen.value = true
}

const guardarNuevaTarea = async () => {
  const nombreLimpio = formNuevaTarea.value.nombre.trim()
  if (!nombreLimpio) return

  // Validar si ya existe una tarea con el mismo nombre en el catálogo (insensible a mayúsculas/minúsculas)
  const tareaExistente = catalogTareas.value.find(
    (t: any) => t.nombre && t.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
  )
  if (tareaExistente) {
    showToast(`La tarea "${nombreLimpio}" ya existe en el catálogo. Se ha seleccionado automáticamente.`, 'info')
    if (!tareasIndividualesIds.value.includes(tareaExistente.id)) {
      tareasIndividualesIds.value.push(tareaExistente.id)
    }
    modalNuevaTareaOpen.value = false
    return
  }

  guardandoNuevaTarea.value = true
  try {
    const { data: newT, error } = await supabase
      .from('tareas')
      .insert({
        nombre: nombreLimpio,
        descripcion: formNuevaTarea.value.descripcion.trim(),
        activa: true
      })
      .select()
      .single()

    if (error) throw error

    catalogTareas.value.unshift(newT)
    tareasIndividualesIds.value.push(newT.id)
    showToast('Tarea creada y seleccionada para asignación')
    modalNuevaTareaOpen.value = false
  } catch (err: any) {
    showToast(err.message || 'Error al crear la tarea', 'error')
  } finally {
    guardandoNuevaTarea.value = false
  }
}

watch([dias, colaboradorId, checklistDestinoId], () => {
  cargarAsignacionesSemana()
})

watch(() => props.checklistIdInicial, (newVal) => {
  if (newVal && newVal !== 'todos') {
    checklistDestinoId.value = Number(newVal)
  }
}, { immediate: true })

watch(checklistsDisponibles, (list) => {
  if (list && list.length > 0) {
    if (!checklistDestinoId.value || !list.some(c => c.id === checklistDestinoId.value)) {
      if (props.checklistIdInicial && props.checklistIdInicial !== 'todos') {
        checklistDestinoId.value = Number(props.checklistIdInicial)
      } else {
        checklistDestinoId.value = list[0].id
      }
    }
  }
}, { immediate: true })

watch(grupoSeleccionadoId, () => {
  if (modoAsignacion.value === 'seleccionar_grupo') {
    seleccionarTodasTareasDelGrupo()
  }
})
</script>
