// composables/useSemanaUTC6.js
//
// Calcula la semana (lunes → domingo) según la hora de América Central
// (UTC-6, sin horario de verano), sin depender de la zona horaria del
// navegador de quien administra el sistema.

const OFFSET_HORAS_UTC6 = 6
const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function relojDeParedUTC6(fechaBase) {
  const ms = fechaBase.getTime() - OFFSET_HORAS_UTC6 * 60 * 60 * 1000
  return new Date(ms)
}

function aISO(fecha) {
  return fecha.toISOString().slice(0, 10) // YYYY-MM-DD
}

function lunesDeLaSemana(fechaUTC6) {
  const diaSemana = fechaUTC6.getUTCDay() // 0 = domingo ... 6 = sábado
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana
  const lunes = new Date(fechaUTC6)
  lunes.setUTCDate(lunes.getUTCDate() + diff)
  lunes.setUTCHours(0, 0, 0, 0)
  return lunes
}

export function useSemanaUTC6(fechaInicial = new Date()) {
  const ancla = ref(relojDeParedUTC6(fechaInicial))

  const lunes = computed(() => lunesDeLaSemana(ancla.value))

  const dias = computed(() => {
    const hoyISO = aISO(relojDeParedUTC6(new Date()))
    return Array.from({ length: 7 }).map((_, i) => {
      const f = new Date(lunes.value)
      f.setUTCDate(f.getUTCDate() + i)
      const fechaISO = aISO(f)
      return {
        fecha: fechaISO,
        dia: NOMBRES_DIA[f.getUTCDay()],
        esHoy: fechaISO === hoyISO,
      }
    })
  })

  const rangoTexto = computed(() => {
    const inicio = dias.value[0].fecha
    const fin = dias.value[6].fecha
    return `${inicio} → ${fin}`
  })

  function semanaSiguiente() {
    const nueva = new Date(ancla.value)
    nueva.setUTCDate(nueva.getUTCDate() + 7)
    ancla.value = nueva
  }

  function semanaAnterior() {
    const nueva = new Date(ancla.value)
    nueva.setUTCDate(nueva.getUTCDate() - 7)
    ancla.value = nueva
  }

  // anio: ej. 2026 · mesIndex0: 0 = enero ... 11 = diciembre
  function irAMes(anio, mesIndex0) {
    const primerDiaMes = new Date(Date.UTC(anio, mesIndex0, 1, OFFSET_HORAS_UTC6))
    ancla.value = relojDeParedUTC6(primerDiaMes)
  }

  return { ancla, lunes, dias, rangoTexto, semanaSiguiente, semanaAnterior, irAMes }
}
