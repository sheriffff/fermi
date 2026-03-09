import { ref, computed } from 'vue'
import { getPlayResponses } from '@/lib/supabase'

export function useTestResults(preguntas, respuestas) {
  const allPlayResponses = ref({})
  const isLoadingResponses = ref(false)

  function logErrBg(r) {
    if (r.inRange) return 'bg-emerald-50'
    if (r.logErr === null) return 'bg-neutral-50'
    if (r.logErr < 1) return 'bg-amber-50'
    return 'bg-red-50'
  }

  function logErrLabel(r) {
    if (r.inRange) return 'text-emerald-500'
    if (r.logErr === null) return 'text-neutral-400'
    if (r.logErr < 1) return 'text-amber-500'
    return 'text-red-500'
  }

  function logErrValueClass(r) {
    if (r.inRange) return 'text-emerald-800'
    if (r.logErr === null) return 'text-neutral-800'
    if (r.logErr < 1) return 'text-amber-800'
    return 'text-red-800'
  }

  const resultsData = computed(() => {
    return preguntas.value.map((q, i) => {
      const key = `p${i + 1}`
      const answer = respuestas.value[key]
      const hasP = q.p05 != null && q.p95 != null
      let logErr = null
      let inRange = false

      if (answer != null && answer > 0 && hasP) {
        if (answer >= q.p05 && answer <= q.p95) {
          inRange = true
          logErr = 0
        } else {
          const bound = answer < q.p05 ? q.p05 : q.p95
          logErr = Math.abs(Math.log10(answer / bound))
        }
      }

      const population = allPlayResponses.value[q.id] || []
      let percentile = null
      if (logErr !== null && population.length > 0 && hasP) {
        const popLogErrs = population.map(r => {
          if (r <= 0) return null
          if (r >= q.p05 && r <= q.p95) return 0
          const bound = r < q.p05 ? q.p05 : q.p95
          return Math.abs(Math.log10(r / bound))
        }).filter(e => e !== null)
        if (popLogErrs.length > 0) {
          percentile = popLogErrs.filter(e => e > logErr).length / popLogErrs.length
        }
      }

      return { num: i + 1, texto: q.texto, answer, p05: q.p05, p95: q.p95, hasP, logErr, inRange, population, percentile }
    })
  })

  const finalScore = computed(() => {
    const valid = resultsData.value.filter(r => r.percentile !== null)
    if (!valid.length) return null
    return ((valid.reduce((s, r) => s + r.percentile, 0) / valid.length) * 10).toFixed(1)
  })

  const avgLogErr = computed(() => {
    const valid = resultsData.value.filter(r => r.logErr !== null)
    if (!valid.length) return null
    return (valid.reduce((s, r) => s + r.logErr, 0) / valid.length).toFixed(2)
  })

  async function fetchAllResponses() {
    isLoadingResponses.value = true
    await Promise.all(
      preguntas.value
        .filter(q => q.p05 != null && q.p95 != null)
        .map(async q => {
          try {
            const r = await getPlayResponses(q.id)
            allPlayResponses.value[q.id] = r
          } catch (e) { /* silencioso */ }
        })
    )
    isLoadingResponses.value = false
  }

  return { resultsData, finalScore, avgLogErr, isLoadingResponses, fetchAllResponses, logErrBg, logErrLabel, logErrValueClass }
}
