<template>
  <div class="outlook-container">
    <!-- Grid Principal: Columna de Días (Izquierda/Derecha adaptable) y Panel de Detalle Outlook -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      <!-- =========================================================================
           COLUMNA DE DÍAS DE LA SEMANA (SELECTOR DE DÍA) - 4 columnas en Desktop
           ========================================================================= -->
      <div class="lg:col-span-4 space-y-3">
        
        <!-- Botón / Tarjeta: Resumen Semanal (Deseleccionar Día) -->
        <button
          type="button"
          class="w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs"
          :class="diaSeleccionadoFecha === null 
            ? 'border-primary bg-primary/10 ring-2 ring-primary/20 text-primary shadow-sm' 
            : 'border-base-200 bg-base-100 hover:border-primary/40 text-base-content'"
          @click="seleccionarDia(null)"
        >
          <div class="flex items-center gap-3">
            <div 
              class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors"
              :class="diaSeleccionadoFecha === null ? 'bg-primary text-white' : 'bg-base-200 text-base-content'"
            >
              <LayoutDashboard :size="18" />
            </div>
            <div>
              <div class="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                <span>Resumen Semanal</span>
                <span v-if="diaSeleccionadoFecha === null" class="badge badge-primary badge-xs text-[9px] font-bold">Activo</span>
              </div>
              <p class="text-[11px] opacity-70 font-medium mt-0.5">
                Todas las tareas asignadas
              </p>
            </div>
          </div>

          <div class="text-right">
            <span class="badge font-bold text-xs" :class="diaSeleccionadoFecha === null ? 'badge-primary' : 'badge-ghost'">
              {{ totalTareasSemana }}
            </span>
          </div>
        </button>

        <!-- Separador de Días -->
        <div class="flex items-center justify-between px-2 pt-1">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50">
            Días de la semana
          </span>
          <span class="text-[10px] font-bold text-base-content/60">
            {{ tareasCompletadasSemana }}/{{ totalTareasSemana }} completadas
          </span>
        </div>

        <!-- Lista de Tarjetas de Días -->
        <div class="space-y-2">
          <div
            v-for="dia in semana"
            :key="dia.fecha"
            class="group w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 shadow-xs"
            :class="[
              diaSeleccionadoFecha === dia.fecha 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm' 
                : (dia.esHoy ? 'border-primary/40 bg-base-100 hover:border-primary' : 'border-base-200 bg-base-100 hover:border-base-300 hover:bg-base-200/40')
            ]"
            @click="seleccionarDia(dia.fecha)"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <!-- Número de Día / Inicial -->
                <div 
                  class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-colors"
                  :class="[
                    diaSeleccionadoFecha === dia.fecha 
                      ? 'bg-primary text-white shadow-xs' 
                      : (dia.esHoy ? 'bg-primary/20 text-primary font-extrabold' : 'bg-base-200 text-base-content/80 group-hover:bg-base-300')
                  ]"
                >
                  {{ obtenerNumeroDia(dia.fecha) }}
                </div>

                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="font-extrabold text-xs text-base-content leading-tight">
                      {{ dia.dia }}
                    </span>
                    <span v-if="dia.esHoy" class="badge badge-primary badge-xs text-[8px] font-black uppercase py-0.5 px-1.5">
                      Hoy
                    </span>
                  </div>
                  <span class="text-[10px] text-base-content/50 font-medium block mt-0.5">
                    {{ dia.fecha }}
                  </span>
                </div>
              </div>

              <!-- Conteo de Tareas del Día -->
              <div class="flex items-center gap-1.5">
                <span 
                  v-if="incidenciasDeFecha(dia.fecha).length > 0"
                  class="badge badge-warning badge-xs font-black text-[9px] text-warning-content gap-0.5"
                  title="Incidencias registradas este día"
                >
                  <AlertTriangle :size="10" />
                  {{ incidenciasDeFecha(dia.fecha).length }}
                </span>

                <span 
                  class="badge badge-sm font-extrabold text-[11px]"
                  :class="[
                    conteoCompletadasDia(dia) === (dia.tareas || []).length && (dia.tareas || []).length > 0
                      ? 'badge-success text-white'
                      : (diaSeleccionadoFecha === dia.fecha ? 'badge-primary' : 'badge-ghost text-base-content/70')
                  ]"
                >
                  {{ conteoCompletadasDia(dia) }}/{{ (dia.tareas || []).length }}
                </span>
              </div>
            </div>

            <!-- Barra de Progreso del Día -->
            <div class="w-full bg-base-200 h-1.5 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-300"
                :class="conteoCompletadasDia(dia) === (dia.tareas || []).length && (dia.tareas || []).length > 0 ? 'bg-success' : 'bg-primary'"
                :style="{ width: `${calcularPorcentajeDia(dia)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>


      <!-- =========================================================================
           PANEL PRINCIPAL ESTILO OUTLOOK (8 columnas en Desktop)
           ========================================================================= -->
      <div class="lg:col-span-8 space-y-4">

        <!-- =======================================================================
             CASO 1: NINGÚN DÍA SELECCIONADO -> RESUMEN EJECUTIVO SEMANAL
             ======================================================================= -->
        <div v-if="diaSeleccionadoFecha === null" class="space-y-5">
          <!-- Tarjeta de Bienvenida y Estadísticas Semanales -->
          <div class="bg-base-100 rounded-3xl p-6 border border-base-200 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-200 pb-5">
              <div class="space-y-1">
                <span class="badge badge-primary font-bold text-[10px] uppercase tracking-wider">
                  Panel General
                </span>
                <h2 class="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                  Resumen General de la Semana
                </h2>
                <p class="text-xs text-base-content/60 font-medium">
                  Selecciona un día en la lista lateral para ver o completar tus tareas programadas.
                </p>
              </div>

              <!-- Indicador de Avance General -->
              <div class="flex items-center gap-3 bg-base-200/60 p-3 rounded-2xl border border-base-300">
                <div class="radial-progress text-primary font-black text-xs" :style="`--value:${porcentajeSemana}; --size:3rem; --thickness: 4px;`" role="progressbar">
                  {{ porcentajeSemana }}%
                </div>
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 block">Cumplimiento</span>
                  <span class="text-xs font-bold text-base-content">{{ tareasCompletadasSemana }} de {{ totalTareasSemana }} tareas</span>
                </div>
              </div>
            </div>

            <!-- Métricas Clave de la Semana -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-4 rounded-2xl bg-base-200/50 border border-base-200 flex items-center gap-3">
                <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <ListTodo :size="20" />
                </div>
                <div>
                  <div class="text-xl font-black text-base-content">{{ totalTareasSemana }}</div>
                  <div class="text-[11px] font-bold text-base-content/60">Tareas Asignadas</div>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-base-200/50 border border-base-200 flex items-center gap-3">
                <div class="p-2.5 rounded-xl bg-success/10 text-success">
                  <CheckCircle2 :size="20" />
                </div>
                <div>
                  <div class="text-xl font-black text-success">{{ tareasCompletadasSemana }}</div>
                  <div class="text-[11px] font-bold text-base-content/60">Completadas con Foto</div>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-base-200/50 border border-base-200 flex items-center gap-3">
                <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <AlertTriangle :size="20" />
                </div>
                <div>
                  <div class="text-xl font-black text-amber-500">{{ incidencias.length }}</div>
                  <div class="text-[11px] font-bold text-base-content/60">Incidencias Reportadas</div>
                </div>
              </div>
            </div>

            <!-- Desglose por Días de la Semana -->
            <div class="space-y-3">
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-base-content/60">
                Distribución Semanal de Tareas
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  v-for="dia in semana"
                  :key="dia.fecha"
                  class="p-3.5 rounded-2xl border border-base-200 bg-base-100 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-between group"
                  @click="seleccionarDia(dia.fecha)"
                >
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
                      :class="dia.esHoy ? 'bg-primary text-white' : 'bg-base-200 text-base-content group-hover:bg-primary/20 group-hover:text-primary'"
                    >
                      {{ obtenerNumeroDia(dia.fecha) }}
                    </div>
                    <div>
                      <div class="text-xs font-black text-base-content flex items-center gap-1.5">
                        <span>{{ dia.dia }}</span>
                        <span v-if="dia.esHoy" class="badge badge-primary badge-xs text-[8px] font-bold">Hoy</span>
                      </div>
                      <span class="text-[10px] text-base-content/50">{{ dia.fecha }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-base-content/70">
                      {{ (dia.tareas || []).length }} tareas
                    </span>
                    <ChevronRight :size="14" class="text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- =======================================================================
             CASO 2: DÍA SELECCIONADO -> MASTER-DETAIL TIPO OUTLOOK
             ======================================================================= -->
        <div v-else class="space-y-4">
          
          <!-- Encabezado del Día Seleccionado -->
          <div class="bg-base-100 rounded-3xl p-5 border border-base-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-base shadow-sm">
                {{ obtenerNumeroDia(diaActivoObjeto?.fecha || '') }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-black text-base-content leading-tight">
                    {{ diaActivoObjeto?.dia }}
                  </h2>
                  <span v-if="diaActivoObjeto?.esHoy" class="badge badge-primary badge-xs text-[9px] font-black uppercase">
                    Hoy
                  </span>
                </div>
                <p class="text-xs text-base-content/60 font-medium">
                  {{ diaActivoObjeto?.fecha }} · {{ tareasDelDiaActivo.length }} tareas asignadas
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="btn btn-warning btn-xs sm:btn-sm text-warning-content font-bold gap-1.5 rounded-xl shadow-xs"
                @click="emit('abrir-registrar-incidencia', diaActivoObjeto?.fecha)"
              >
                <AlertTriangle :size="14" />
                <span>Registrar Incidencia</span>
              </button>

              <button
                type="button"
                class="btn btn-ghost btn-xs sm:btn-sm text-base-content/70 font-bold rounded-xl"
                @click="seleccionarDia(null)"
              >
                <span>Cerrar Día</span>
              </button>
            </div>
          </div>

          <!-- Incidencias Registradas en este Día (si existen) -->
          <div v-if="incidenciasDelDiaActivo.length > 0" class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
            <div class="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <AlertTriangle :size="14" />
              <span>Incidencias registradas este día ({{ incidenciasDelDiaActivo.length }})</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="inc in incidenciasDelDiaActivo"
                :key="inc.id"
                class="p-2.5 rounded-xl bg-base-100 border border-amber-500/20 flex items-center justify-between gap-2 cursor-pointer hover:border-amber-500 transition-all shadow-xs"
                @click="emit('ver-incidencia', inc)"
              >
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-black text-base-content truncate">{{ inc.titulo }}</div>
                  <div class="text-[10px] text-base-content/60 truncate">{{ inc.hora }} · {{ inc.descripcion || 'Sin descripción' }}</div>
                </div>
                <img v-if="inc.foto_url" :src="inc.foto_url" alt="Foto" class="w-8 h-8 rounded-lg object-cover border border-amber-400 flex-shrink-0" />
              </div>
            </div>
          </div>

          <!-- Master-Detail Split Grid (Lista de Tareas a la izquierda, Detalle completo a la derecha) -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            <!-- Sub-Panel Izquierdo: Lista de Tareas del Día (5 columnas en desktop) -->
            <div class="md:col-span-5 space-y-2">
              <div class="flex items-center justify-between px-1">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60">
                  Lista de Tareas ({{ tareasDelDiaActivo.length }})
                </span>
                <span class="text-[11px] font-bold text-success">
                  {{ tareasDelDiaActivo.filter(t => t.completada).length }} hechas
                </span>
              </div>

              <!-- Sin tareas en este día -->
              <div v-if="tareasDelDiaActivo.length === 0" class="p-8 text-center bg-base-100 rounded-3xl border border-dashed border-base-300 text-base-content/50 space-y-2">
                <Clock class="w-8 h-8 mx-auto text-base-content/30" />
                <p class="text-xs font-bold">No hay tareas programadas para este día.</p>
              </div>

              <!-- Tarjetas de Tareas estilo Outlook Inbox -->
              <div v-else class="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                <div
                  v-for="tarea in tareasDelDiaActivo"
                  :key="tarea.id"
                  class="p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative shadow-xs"
                  :class="[
                    tareaSeleccionada?.id === tarea.id 
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm' 
                      : (tarea.completada ? 'border-success/30 bg-success/5 hover:border-success/60' : 'border-base-200 bg-base-100 hover:border-primary/40')
                  ]"
                  @click="seleccionarTarea(tarea)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-1.5 mb-1">
                        <span 
                          class="badge badge-xs text-[9px] font-black"
                          :class="tarea.completada ? 'badge-success text-white' : 'badge-ghost text-base-content/70'"
                        >
                          {{ tarea.completada ? '✓ Hecha' : 'Pendiente' }}
                        </span>

                        <span v-if="tarea.grupo_nombre_snapshot" class="text-[10px] font-bold text-primary truncate max-w-[120px]">
                          📁 {{ tarea.grupo_nombre_snapshot }}
                        </span>
                      </div>

                      <h4 
                        class="text-xs font-extrabold text-base-content leading-snug truncate"
                        :class="{ 'line-through opacity-70': tarea.completada }"
                      >
                        {{ tarea.tarea?.nombre || tarea.tarea_nombre_snapshot || 'Tarea' }}
                      </h4>

                      <!-- Badge de Responsable / Resuelve -->
                      <div class="flex flex-wrap items-center gap-1 mt-1.5 text-[10px]">
                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-base-200 text-base-content/70 font-semibold">
                          👤 Resp: {{ tarea.colaboradorResponsableNombre || 'Sin asignar' }}
                        </span>
                        <span 
                          v-if="tarea.completada && tarea.colaboradorResuelveNombre"
                          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold"
                          :class="tarea.colaboradorResuelveId !== tarea.colaboradorResponsableId ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300' : 'bg-success/15 text-success'"
                        >
                          ✓ Hecha por: {{ tarea.colaboradorResuelveNombre }}
                        </span>
                      </div>
                    </div>

                    <!-- Mini foto indicador si está completada -->
                    <div v-if="tarea.completada && tarea.foto_url" class="w-8 h-8 rounded-lg overflow-hidden border border-success/40 flex-shrink-0">
                      <img :src="tarea.foto_url" alt="Foto" class="w-full h-full object-cover" />
                    </div>
                  </div>

                  <p v-if="tarea.tarea?.descripcion" class="text-[11px] text-base-content/60 line-clamp-1 font-medium">
                    {{ tarea.tarea.descripcion }}
                  </p>
                </div>
              </div>
            </div>


            <!-- Sub-Panel Derecho: Visor Detallado de la Tarea (7 columnas en desktop) -->
            <div class="md:col-span-7">
              <div v-if="tareaSeleccionada" class="bg-base-100 rounded-3xl p-6 border border-base-200 shadow-sm space-y-5">
                
                <!-- Encabezado del Detalle -->
                <div class="border-b border-base-200 pb-4 space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <span 
                      class="badge font-black text-xs py-2 px-3"
                      :class="tareaSeleccionada.completada ? 'badge-success text-white' : 'badge-warning text-warning-content'"
                    >
                      {{ tareaSeleccionada.completada ? '✓ Tarea Completada' : '⏳ Tarea Pendiente' }}
                    </span>

                    <span v-if="tareaSeleccionada.grupo_nombre_snapshot" class="badge badge-outline badge-primary font-bold text-xs py-2">
                      📁 {{ tareaSeleccionada.grupo_nombre_snapshot }}
                    </span>

                    <span v-if="tareaSeleccionada.proyectoNombre" class="badge badge-ghost font-bold text-xs py-2">
                      🏢 {{ tareaSeleccionada.proyectoNombre }}
                    </span>
                  </div>

                  <h3 class="text-lg font-black text-base-content leading-tight">
                    {{ tareaSeleccionada.tarea?.nombre || tareaSeleccionada.tarea_nombre_snapshot || 'Detalle de Tarea' }}
                  </h3>
                </div>

                <!-- SECCIÓN NUEVA: Asignación y Quién la Completó -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Tarjeta Responsable Asignado -->
                  <div class="p-3.5 rounded-2xl bg-base-200/50 border border-base-200 space-y-1.5">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 block">
                      👤 Responsable Asignado
                    </span>
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs">
                        {{ getInitials(tareaSeleccionada.colaboradorResponsableNombre || 'U') }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="font-bold text-xs text-base-content truncate">
                          {{ tareaSeleccionada.colaboradorResponsableNombre || 'Sin asignar' }}
                        </div>
                        <div class="text-[10px] text-base-content/60">
                          Encargado programado
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Tarjeta Completado Por -->
                  <div 
                    class="p-3.5 rounded-2xl border space-y-1.5 transition-all"
                    :class="tareaSeleccionada.completada 
                      ? (tareaSeleccionada.colaboradorResuelveId !== tareaSeleccionada.colaboradorResponsableId 
                          ? 'bg-amber-500/10 border-amber-500/30' 
                          : 'bg-success/10 border-success/30') 
                      : 'bg-base-200/30 border-dashed border-base-300'"
                  >
                    <span class="text-[10px] font-extrabold uppercase tracking-wider block" :class="tareaSeleccionada.completada ? 'text-base-content/70' : 'text-base-content/40'">
                      🛠️ Resuelto Por
                    </span>

                    <div v-if="tareaSeleccionada.completada" class="flex items-center gap-2.5">
                      <div 
                        class="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white"
                        :class="tareaSeleccionada.colaboradorResuelveId !== tareaSeleccionada.colaboradorResponsableId ? 'bg-amber-600' : 'bg-success'"
                      >
                        {{ getInitials(tareaSeleccionada.colaboradorResuelveNombre || 'U') }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="font-bold text-xs text-base-content truncate">
                          {{ tareaSeleccionada.colaboradorResuelveNombre || 'Usuario' }}
                        </div>
                        <div class="text-[10px] text-base-content/60" v-if="tareaSeleccionada.completada_at">
                          {{ formatearFechaHora(tareaSeleccionada.completada_at) }}
                        </div>
                      </div>
                    </div>

                    <div v-else class="text-xs text-base-content/50 italic py-1">
                      Aún no se ha completado
                    </div>
                  </div>
                </div>

                <!-- Aviso si fue resuelta por otro compañero -->
                <div 
                  v-if="tareaSeleccionada.completada && tareaSeleccionada.colaboradorResuelveNombre && tareaSeleccionada.colaboradorResuelveId !== tareaSeleccionada.colaboradorResponsableId"
                  class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2"
                >
                  <AlertTriangle :size="15" class="flex-shrink-0 text-amber-600" />
                  <span>
                    <strong>Resolución colaborativa:</strong> Esta tarea estaba asignada a <em>{{ tareaSeleccionada.colaboradorResponsableNombre }}</em> y fue completada por <em>{{ tareaSeleccionada.colaboradorResuelveNombre }}</em>.
                  </span>
                </div>

                <!-- Descripción Completa -->
                <div class="space-y-2">
                  <label class="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50 block">
                    Instrucciones / Descripción
                  </label>
                  <div class="p-4 rounded-2xl bg-base-200/50 border border-base-200 text-xs sm:text-sm text-base-content/80 leading-relaxed">
                    {{ tareaSeleccionada.tarea?.descripcion || 'No se proporcionó una descripción detallada para esta tarea.' }}
                  </div>
                </div>

                <!-- Observaciones (si fueron ingresadas) -->
                <div v-if="tareaSeleccionada.observaciones" class="space-y-2">
                  <label class="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50 block">
                    Observaciones registradas
                  </label>
                  <div class="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-base-content/80 leading-relaxed">
                    {{ tareaSeleccionada.observaciones }}
                  </div>
                </div>

                <!-- Evidencia Fotográfica -->
                <div class="space-y-2">
                  <label class="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50 block flex items-center justify-between">
                    <span>Evidencia Fotográfica</span>
                    <span v-if="tareaSeleccionada.completada && tareaSeleccionada.foto_url" class="text-[10px] text-success font-bold">
                      ✓ Foto adjunta en tiempo real
                    </span>
                  </label>

                  <!-- Si ya tiene foto tomada -->
                  <div v-if="tareaSeleccionada.foto_url" class="space-y-2">
                    <div class="relative rounded-2xl overflow-hidden border border-base-300 bg-black/5 flex items-center justify-center max-h-72 shadow-xs">
                      <img 
                        :src="tareaSeleccionada.foto_url" 
                        alt="Evidencia fotográfica" 
                        class="w-full h-auto max-h-72 object-contain rounded-2xl"
                      />
                    </div>
                    <div class="text-right">
                      <a 
                        :href="tareaSeleccionada.foto_url" 
                        target="_blank" 
                        class="btn btn-ghost btn-xs font-bold text-primary gap-1"
                      >
                        <Eye :size="13" />
                        <span>Ver foto en tamaño completo</span>
                      </a>
                    </div>
                  </div>

                  <!-- Si está pendiente -->
                  <div v-else class="p-6 rounded-2xl border-2 border-dashed border-base-300 bg-base-200/30 text-center space-y-2">
                    <Camera class="w-8 h-8 mx-auto text-base-content/40" />
                    <p class="text-xs font-bold text-base-content/70">
                      Esta tarea aún no cuenta con evidencia fotográfica.
                    </p>
                    <p class="text-[11px] text-base-content/50">
                      Cualquier colaborador del proyecto puede pulsar el botón inferior para capturar la fotografía y marcarla como completada.
                    </p>
                  </div>
                </div>

                <!-- Botones de Acción de la Tarea -->
                <div class="pt-4 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <!-- Botón Desmarcar (si ya está completada) -->
                  <button
                    v-if="tareaSeleccionada.completada"
                    type="button"
                    class="btn btn-ghost btn-sm text-error font-bold rounded-xl w-full sm:w-auto"
                    @click="emit('desmarcar', tareaSeleccionada.id)"
                  >
                    <RotateCcw :size="15" />
                    <span>Desmarcar Tarea</span>
                  </button>

                  <div v-else class="hidden sm:block"></div>

                  <!-- Botón Principal: Marcar como Hecha (Abre Cámara) -->
                  <button
                    v-if="!tareaSeleccionada.completada"
                    type="button"
                    class="btn btn-primary btn-md font-black text-xs uppercase tracking-wider rounded-2xl gap-2 shadow-md w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all"
                    @click="emit('iniciar-marcado', tareaSeleccionada)"
                  >
                    <Camera :size="18" />
                    <span>Tomar Foto y Completar</span>
                  </button>

                  <div v-else class="badge badge-success text-white font-bold p-3 gap-1.5">
                    <CheckCircle2 :size="16" />
                    <span>Completada</span>
                  </div>
                </div>

              </div>

              <!-- Estado Vacío: No hay tarea seleccionada en el día -->
              <div v-else class="bg-base-100 rounded-3xl p-10 border border-dashed border-base-300 text-center space-y-3">
                <ListTodo class="w-10 h-10 mx-auto text-base-content/30" />
                <h4 class="text-sm font-bold text-base-content">Ninguna tarea seleccionada</h4>
                <p class="text-xs text-base-content/60 max-w-sm mx-auto font-medium">
                  Haz clic en cualquiera de las tareas de la lista para ver su descripción completa y marcarla como completada.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Camera, 
  Eye, 
  ListTodo,
  LayoutDashboard,
  ChevronRight,
  RotateCcw
} from 'lucide-vue-next'
import type { Incidencia } from '~/composables/useIncidencias'

const props = defineProps({
  semana: { type: Array as () => any[], required: true },
  incidencias: { type: Array as () => Incidencia[], default: () => [] },
  proyectos: { type: Array as () => any[], default: () => [] },
  cargando: { type: Boolean, default: false }
})

const emit = defineEmits([
  'iniciar-marcado',
  'desmarcar',
  'abrir-registrar-incidencia',
  'ver-incidencia'
])

// Estado reactivo: Día seleccionado (null = Resumen Semanal)
const diaSeleccionadoFecha = ref<string | null>(null)

// Tarea activa seleccionada para ver su detalle en el visor Outlook
const tareaSeleccionada = ref<any | null>(null)

function seleccionarDia(fecha: string | null) {
  diaSeleccionadoFecha.value = fecha
  if (fecha) {
    const diaObj = props.semana.find(d => d.fecha === fecha)
    const tareas = diaObj?.tareas || []
    tareaSeleccionada.value = tareas.length > 0 ? tareas[0] : null
  } else {
    tareaSeleccionada.value = null
  }
}

function seleccionarTarea(tarea: any) {
  tareaSeleccionada.value = tarea
}

const diaActivoObjeto = computed(() => {
  if (!diaSeleccionadoFecha.value) return null
  return props.semana.find(d => d.fecha === diaSeleccionadoFecha.value) || null
})

const tareasDelDiaActivo = computed(() => {
  return diaActivoObjeto.value?.tareas || []
})

const incidenciasDelDiaActivo = computed(() => {
  if (!diaSeleccionadoFecha.value) return []
  return (props.incidencias || []).filter(inc => inc.fecha === diaSeleccionadoFecha.value)
})

function incidenciasDeFecha(fechaStr: string) {
  return (props.incidencias || []).filter(inc => inc.fecha === fechaStr)
}

function obtenerNumeroDia(fechaStr: string) {
  if (!fechaStr) return ''
  const partes = fechaStr.split('-')
  return partes[2] || ''
}

function conteoCompletadasDia(dia: any) {
  return (dia.tareas || []).filter((t: any) => t.completada).length
}

function calcularPorcentajeDia(dia: any) {
  const total = (dia.tareas || []).length
  if (total === 0) return 0
  const completadas = conteoCompletadasDia(dia)
  return Math.round((completadas / total) * 100)
}

// Estadísticas Semanales Globales
const totalTareasSemana = computed(() => {
  return (props.semana || []).reduce((acc, dia) => acc + (dia.tareas?.length || 0), 0)
})

const tareasCompletadasSemana = computed(() => {
  return (props.semana || []).reduce((acc, dia) => {
    return acc + (dia.tareas || []).filter((t: any) => t.completada).length
  }, 0)
})

const porcentajeSemana = computed(() => {
  if (totalTareasSemana.value === 0) return 0
  return Math.round((tareasCompletadasSemana.value / totalTareasSemana.value) * 100)
})

const getInitials = (str: string) => {
  if (!str) return 'U'
  return str.substring(0, 2).toUpperCase()
}

const formatearFechaHora = (isoStr: string) => {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    const fecha = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    return `${fecha} · ${hora} hrs`
  } catch (e) {
    return isoStr
  }
}

// Mantener la tarea seleccionada sincronizada si cambia el checklist/tareas
watch(() => props.semana, (nuevaSemana) => {
  if (diaSeleccionadoFecha.value) {
    const diaObj = nuevaSemana.find(d => d.fecha === diaSeleccionadoFecha.value)
    const tareas = diaObj?.tareas || []
    if (tareaSeleccionada.value) {
      const encontrada = tareas.find((t: any) => t.id === tareaSeleccionada.value.id)
      tareaSeleccionada.value = encontrada || (tareas.length > 0 ? tareas[0] : null)
    } else if (tareas.length > 0) {
      tareaSeleccionada.value = tareas[0]
    }
  }
}, { deep: true })
</script>

<style scoped>
.outlook-container {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
