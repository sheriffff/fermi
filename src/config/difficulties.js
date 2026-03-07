export const colors = {
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700',
    cell: 'bg-emerald-50/60 hover:bg-emerald-50',
    border: 'border-emerald-100',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-700',
    cell: 'bg-blue-50/60 hover:bg-blue-50',
    border: 'border-blue-100',
  },
  orange: {
    badge: 'bg-orange-100 text-orange-700',
    cell: 'bg-orange-50/60 hover:bg-orange-50',
    border: 'border-orange-100',
  },
  red: {
    badge: 'bg-red-100 text-red-700',
    cell: 'bg-red-50/60 hover:bg-red-50',
    border: 'border-red-100',
  },
  violet: {
    badge: 'bg-violet-100 text-violet-700',
    cell: 'bg-violet-50/60 hover:bg-violet-50',
    border: 'border-violet-100',
  },
}

export const testDifficulties = [
  { level: 'Fácil', color: 'emerald' },
  { level: 'Intermedio', color: 'blue' },
  { level: 'Difícil', color: 'orange' },
  { level: 'Muy difícil', color: 'red' },
]

export function getDifficulty(d) {
  if (d == null) return null
  return testDifficulties[Math.min(Math.max(Math.ceil(d) - 1, 0), testDifficulties.length - 1)]
}
