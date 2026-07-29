// composables/usePermisos.js
//
// Punto único de control de permisos por rol. Hoy no hay restricciones
// reales (puede() siempre devuelve true), pero todas las vistas y
// componentes ya consultan este composable en vez de decidir por su cuenta.
// Cuando se active el sistema de roles, el cambio se hace UNA sola vez aquí,
// sin tocar el resto de la app.
//
// Ejemplo de cómo se verá cuando haya roles reales:
//
// const PERMISOS_POR_ROL = {
//   admin: ['ver_checklist_todos', 'editar_checklist', 'gestionar_grupos', 'gestionar_usuarios'],
//   supervisor: ['ver_checklist_todos', 'editar_checklist'],
//   colaborador: ['editar_checklist'], // solo su propio checklist
// }

export function usePermisos() {
  const usuario = useSupabaseUser()

  function puede(_permiso) {
    // TODO (fase 2 - roles reales):
    // const rol = usuario.value?.app_metadata?.rol
    // return PERMISOS_POR_ROL[rol]?.includes(_permiso) ?? false
    return true
  }

  return { usuario, puede }
}
