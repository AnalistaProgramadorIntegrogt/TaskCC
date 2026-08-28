// composables/useExcelTareas.ts
import * as XLSX from 'xlsx'

export interface FilaTareaExcel {
  nombre: string
  descripcion: string
}

export interface ResultadoParseoExcel {
  tareas: FilaTareaExcel[]
  totalFilas: number
  filasIgnoradas: number
  filasDuplicadas: number
  errores: string[]
}

export function useExcelTareas() {
  const supabase = useSupabaseClient()
  const procesando = ref(false)

  /**
   * Genera y descarga un archivo Excel (.xlsx) con las tareas proporcionadas
   * y las columnas "Titulo" y "Descripcion".
   */
  function descargarPlantillaExcel(
    tareasExistentes: { nombre: string; descripcion?: string | null }[] = [],
    nombreArchivo: string = 'plantilla_tareas.xlsx'
  ) {
    let datosExportar: any[] = []

    if (tareasExistentes && tareasExistentes.length > 0) {
      datosExportar = tareasExistentes.map(t => ({
        'Titulo': t.nombre || '',
        'Descripcion': t.descripcion || ''
      }))
    } else {
      // Ejemplos guía si no hay tareas existentes
      datosExportar = [
        {
          'Titulo': 'Inspección de Extintores',
          'Descripcion': 'Verificar manómetro en verde, precinto de seguridad y fecha de vigencia.'
        },
        {
          'Titulo': 'Limpieza y Desinfección de Áreas Comunes',
          'Descripcion': 'Barrer, trapear y sanitizar superficies de alto contacto.'
        },
        {
          'Titulo': 'Revisión de Luminarias y Salidas de Emergencia',
          'Descripcion': 'Comprobar funcionamiento de lámparas y señalización de evacuación.'
        }
      ]
    }

    // Crear la hoja de trabajo a partir del JSON
    const worksheet = XLSX.utils.json_to_sheet(datosExportar, {
      header: ['Titulo', 'Descripcion']
    })

    // Definir anchos de columna óptimos
    worksheet['!cols'] = [
      { wch: 35 }, // Columna A: Titulo
      { wch: 65 }  // Columna B: Descripcion
    ]

    // Crear el libro de trabajo y adjuntar la hoja
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tareas')

    // Asegurar que el nombre de archivo termine en .xlsx
    const filename = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`

    // Descargar el archivo
    XLSX.writeFile(workbook, filename)
  }

  /**
   * Lee y procesa un archivo Excel (.xlsx, .xls) o CSV subido por el usuario.
   * Valida y filtra tareas repetidas dentro del mismo archivo.
   */
  async function leerArchivoExcel(archivo: File): Promise<ResultadoParseoExcel> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })

          // Tomar la primera hoja del libro
          const sheetName = workbook.SheetNames[0]
          if (!sheetName) {
            resolve({
              tareas: [],
              totalFilas: 0,
              filasIgnoradas: 0,
              filasDuplicadas: 0,
              errores: ['El archivo no contiene ninguna hoja de datos.']
            })
            return
          }

          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
            raw: false,
            defval: ''
          })

          const tareas: FilaTareaExcel[] = []
          const errores: string[] = []
          let filasIgnoradas = 0
          let filasDuplicadas = 0
          // Mapa para registrar nombres ya vistos en el archivo: clave normalizada -> fila
          const tareasVistasEnArchivo = new Map<string, number>()

          if (!jsonData || jsonData.length === 0) {
            resolve({
              tareas: [],
              totalFilas: 0,
              filasIgnoradas: 0,
              filasDuplicadas: 0,
              errores: ['La hoja de Excel está vacía.']
            })
            return
          }

          for (let index = 0; index < jsonData.length; index++) {
            const row = jsonData[index]
            const numeroFila = index + 2 // +2 considerando header en fila 1 y base 1

            // Normalización de claves (busca variaciones de Titulo y Descripcion)
            let titulo = ''
            let descripcion = ''

            for (const key of Object.keys(row)) {
              const lowerKey = key.trim().toLowerCase()
              const cleanKey = lowerKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

              if (cleanKey === 'titulo' || cleanKey === 'nombre' || cleanKey === 'tarea' || cleanKey === 'title' || cleanKey === 'task') {
                titulo = String(row[key] || '').trim()
              } else if (cleanKey === 'descripcion' || cleanKey === 'description' || cleanKey === 'detalles' || cleanKey === 'detalle' || cleanKey === 'instrucciones') {
                descripcion = String(row[key] || '').trim()
              }
            }

            // Si no encontró por nombre de columna, intentar por posición (columna 0 y 1)
            if (!titulo && !descripcion) {
              const valores = Object.values(row)
              if (valores.length >= 1) titulo = String(valores[0] || '').trim()
              if (valores.length >= 2) descripcion = String(valores[1] || '').trim()
            }

            // Validar si la fila está completamente vacía
            if (!titulo && !descripcion) {
              filasIgnoradas++
              continue
            }

            if (!titulo) {
              errores.push(`Fila ${numeroFila}: No se especificó el Título de la tarea.`)
              continue
            }

            // VALIDACIÓN: Evitar tareas duplicadas dentro del mismo archivo Excel
            const keyNormalizada = titulo.toLowerCase()
            if (tareasVistasEnArchivo.has(keyNormalizada)) {
              const filaOriginal = tareasVistasEnArchivo.get(keyNormalizada)
              filasDuplicadas++
              errores.push(`Fila ${numeroFila}: La tarea "${titulo}" ya fue definida en la fila ${filaOriginal}. Se omitió el duplicado.`)
              continue
            }

            tareasVistasEnArchivo.set(keyNormalizada, numeroFila)
            tareas.push({
              nombre: titulo,
              descripcion: descripcion
            })
          }

          resolve({
            tareas,
            totalFilas: jsonData.length,
            filasIgnoradas,
            filasDuplicadas,
            errores
          })
        } catch (err: any) {
          console.error('Error al parsear Excel:', err)
          reject(new Error(err.message || 'Error al procesar el archivo Excel.'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo desde el dispositivo.'))
      }

      reader.readAsArrayBuffer(archivo)
    })
  }

  /**
   * Inserta o actualiza masivamente las tareas en la base de datos (Supabase)
   * y opcionalmente las asocia a un grupo recurrente.
   * Garantiza que no se creen tareas duplicadas en la BD.
   */
  async function importarTareasMasivas({
    tareas,
    grupoId = null
  }: {
    tareas: FilaTareaExcel[]
    grupoId?: number | null
  }): Promise<{ creadas: number; actualizadas: number; asociadasAlGrupo: number; omitidasDuplicadas: number }> {
    if (!tareas || tareas.length === 0) {
      return { creadas: 0, actualizadas: 0, asociadasAlGrupo: 0, omitidasDuplicadas: 0 }
    }

    procesando.value = true
    try {
      // 1. Obtener tareas maestras existentes para verificar duplicados por nombre
      const { data: tareasExistentes, error: errExistentes } = await supabase
        .from('tareas')
        .select('id, nombre, descripcion')

      if (errExistentes) throw errExistentes

      const mapaExistentes = new Map<string, any>()
      ;(tareasExistentes || []).forEach(t => {
        if (t.nombre) {
          mapaExistentes.set(t.nombre.trim().toLowerCase(), t)
        }
      })

      const tareasInsertar: { nombre: string; descripcion: string; activa: boolean }[] = []
      const tareasActualizar: { id: number; nombre: string; descripcion: string }[] = []
      const idsTareasFinales: number[] = []
      const nombresNuevosProcesados = new Set<string>()
      let contadorOmitidas = 0

      // Separar entre nuevas y actualizaciones garantizando cero duplicados
      for (const item of tareas) {
        const nombreLimpio = item.nombre.trim()
        const key = nombreLimpio.toLowerCase()

        if (!key) continue

        const existente = mapaExistentes.get(key)

        if (existente) {
          if (!idsTareasFinales.includes(existente.id)) {
            idsTareasFinales.push(existente.id)
          }
          // Si la descripción cambió y viene especificada, la actualizamos
          if (item.descripcion && item.descripcion.trim() !== (existente.descripcion || '').trim()) {
            if (!tareasActualizar.some(t => t.id === existente.id)) {
              tareasActualizar.push({
                id: existente.id,
                nombre: existente.nombre,
                descripcion: item.descripcion.trim()
              })
            }
          }
        } else {
          // Si es nueva tarea: verificar que no haya sido añadida en este mismo lote
          if (nombresNuevosProcesados.has(key)) {
            contadorOmitidas++
            continue
          }
          nombresNuevosProcesados.add(key)
          tareasInsertar.push({
            nombre: nombreLimpio,
            descripcion: item.descripcion ? item.descripcion.trim() : '',
            activa: true
          })
        }
      }

      let contadorCreadas = 0
      let contadorActualizadas = 0

      // 2. Insertar nuevas tareas
      if (tareasInsertar.length > 0) {
        const { data: nuevas, error: errInsertar } = await supabase
          .from('tareas')
          .insert(tareasInsertar)
          .select('id, nombre')

        if (errInsertar) throw errInsertar
        if (nuevas) {
          contadorCreadas = nuevas.length
          nuevas.forEach(n => {
            if (!idsTareasFinales.includes(n.id)) {
              idsTareasFinales.push(n.id)
            }
          })
        }
      }

      // 3. Actualizar tareas existentes
      if (tareasActualizar.length > 0) {
        for (const item of tareasActualizar) {
          await supabase
            .from('tareas')
            .update({ descripcion: item.descripcion })
            .eq('id', item.id)
        }
        contadorActualizadas = tareasActualizar.length
      }

      // 4. Si se especificó un grupo, asociar las tareas al grupo en tareas_recurrentes
      let contadorAsociadas = 0
      if (grupoId && idsTareasFinales.length > 0) {
        // Obtener relaciones existentes en el grupo
        const { data: relExistentes } = await supabase
          .from('tareas_recurrentes')
          .select('tarea_id, orden')
          .eq('grupo_id', grupoId)

        const tareasYaEnGrupo = new Set((relExistentes || []).map(r => r.tarea_id))
        let maxOrden = (relExistentes || []).reduce((max, r) => Math.max(max, r.orden || 0), 0)

        // Deduplicar idsTareasFinales
        const uniqueIds = Array.from(new Set(idsTareasFinales))

        const nuevasRelaciones = uniqueIds
          .filter(tId => !tareasYaEnGrupo.has(tId))
          .map(tId => {
            maxOrden++
            return {
              grupo_id: grupoId,
              tarea_id: tId,
              orden: maxOrden
            }
          })

        if (nuevasRelaciones.length > 0) {
          const { error: errRel } = await supabase
            .from('tareas_recurrentes')
            .insert(nuevasRelaciones)

          if (errRel) throw errRel
          contadorAsociadas = nuevasRelaciones.length
        }
      }

      return {
        creadas: contadorCreadas,
        actualizadas: contadorActualizadas,
        asociadasAlGrupo: contadorAsociadas,
        omitidasDuplicadas: contadorOmitidas
      }
    } catch (e: any) {
      console.error('Error al importar tareas masivas:', e)
      throw e
    } finally {
      procesando.value = false
    }
  }

  return {
    procesando,
    descargarPlantillaExcel,
    leerArchivoExcel,
    importarTareasMasivas
  }
}
