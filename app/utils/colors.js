export const VIBRANT_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#d946ef', // fuchsia-500
  '#f43f5e', // rose-500
]

export function getColaboradorColor(colaboradorId) {
  // Simple deterministic hash based on ID to always return the same color for the same user
  if (!colaboradorId) return '#94a3b8' // slate-400 as default
  
  // Si el ID es numérico o string, generamos un índice
  const hash = String(colaboradorId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return VIBRANT_COLORS[hash % VIBRANT_COLORS.length]
}
