<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getAllQuestions, getQuestionsInTests } from '@/lib/questions.js'

const STORAGE_KEY = 'fermi_difficulty_elo'
const K = 32

const allQuestions = ref([])
const testQuestions = ref([])
const filter = ref('all')
const elos = ref({})
const counts = ref({})
const voteCount = ref(0)
const pairA = ref(null)
const pairB = ref(null)
const view = ref('vote')
const rankingMode = ref('cards')
const loading = ref(true)
const spread = ref(250)
const lastSwapped = ref(null)
const swapIdxA = ref(0)
const swapIdxB = ref(1)

const testIds = computed(() => new Set(testQuestions.value.map(q => q.id)))
const noTestQuestions = computed(() => allQuestions.value.filter(q => !testIds.value.has(q.id)))
const activeQuestions = computed(() => {
  if (filter.value === 'tests') return testQuestions.value
  if (filter.value === 'no-tests') return noTestQuestions.value
  return allQuestions.value
})

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      elos.value = data.elos || {}
      counts.value = data.counts || {}
      voteCount.value = data.voteCount || 0
    }
  } catch {
    elos.value = {}
    counts.value = {}
    voteCount.value = 0
  }
}

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ elos: elos.value, counts: counts.value, voteCount: voteCount.value }))
}

function recordMatch(idA, idB) {
  counts.value[idA] = (counts.value[idA] ?? 0) + 1
  counts.value[idB] = (counts.value[idB] ?? 0) + 1
}

function getElo(id) {
  if (elos.value[id] !== undefined) return elos.value[id]
  const q = allQuestions.value.find(q => q.id === id)
  return q?.elo ?? 1000
}

function updateElo(winnerId, loserId) {
  const ra = getElo(winnerId)
  const rb = getElo(loserId)
  const expected = 1 / (1 + Math.pow(10, (rb - ra) / 400))
  elos.value[winnerId] = Math.round(ra + K * (1 - expected))
  elos.value[loserId] = Math.round(rb + K * (0 - (1 - expected)))
}

function weightedPick(candidates, weights) {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]
    if (r <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

function pickPair() {
  const pool = activeQuestions.value
  if (pool.length < 2) return
  const a = pool[Math.floor(Math.random() * pool.length)]
  const eloA = getElo(a.id)
  const others = pool.filter(q => q.id !== a.id)
  const weights = others.map(q => {
    const dist = Math.exp(-Math.abs(getElo(q.id) - eloA) / spread.value)
    const fresh = (getElo(q.id) === 1000 || (counts.value[q.id] ?? 0) < 5) ? 4 : 1
    return dist * fresh
  })
  pairA.value = a
  pairB.value = weightedPick(others, weights)
}

function vote(harderId, times = 1) {
  const easierId = harderId === pairA.value.id ? pairB.value.id : pairA.value.id
  for (let i = 0; i < times; i++) updateElo(harderId, easierId)
  recordMatch(harderId, easierId)
  voteCount.value++
  saveStorage()
  pickPair()
}

function voteSimilar() {
  const aId = pairA.value.id
  const bId = pairB.value.id
  const ra = getElo(aId)
  const rb = getElo(bId)
  const expectedA = 1 / (1 + Math.pow(10, (rb - ra) / 400))
  elos.value[aId] = Math.round(ra + K * (0.5 - expectedA))
  elos.value[bId] = Math.round(rb + K * (0.5 - (1 - expectedA)))
  recordMatch(aId, bId)
  voteCount.value++
  saveStorage()
  pickPair()
}

function bumpBoth(amount) {
  elos.value[pairA.value.id] = getElo(pairA.value.id) + amount
  elos.value[pairB.value.id] = getElo(pairB.value.id) + amount
  saveStorage()
}

function pickSwapPair() {
  const ranked = rankedQuestions.value
  if (ranked.length < 2) return
  const i = Math.floor(Math.random() * ranked.length)
  const lo = Math.max(0, i - 5)
  const hi = Math.min(ranked.length - 1, i + 5)
  const candidates = []
  for (let j = lo; j <= hi; j++) {
    if (j !== i) candidates.push(j)
  }
  // prefer pairs with smallest elo gap (most uncertain)
  candidates.sort((a, b) =>
    Math.abs(getElo(ranked[a].id) - getElo(ranked[i].id)) -
    Math.abs(getElo(ranked[b].id) - getElo(ranked[i].id))
  )
  // pick from top half of candidates weighted toward smallest gap
  const pool = candidates.slice(0, Math.max(2, Math.ceil(candidates.length / 2)))
  const j = pool[Math.floor(Math.random() * pool.length)]
  swapIdxA.value = Math.min(i, j)
  swapIdxB.value = Math.max(i, j)
}

function doSwap() {
  swapElos(swapIdxA.value, swapIdxB.value)
  pickSwapPair()
}

function keepOrder() {
  pickSwapPair()
}

function swapElos(i, j) {
  const ranked = rankedQuestions.value
  const idA = ranked[i].id
  const idB = ranked[j].id
  const eloA = getElo(idA)
  const eloB = getElo(idB)
  elos.value[idA] = eloB
  elos.value[idB] = eloA
  lastSwapped.value = idA
  setTimeout(() => { lastSwapped.value = null }, 600)
  saveStorage()
}

function handleKeydown(e) {
  if (loading.value) return
  if (e.code === 'Space') {
    e.preventDefault()
    if (view.value === 'vote') voteSimilar()
    else if (view.value === 'ranking' && rankingMode.value === 'swap') keepOrder()
  }
}

function reset() {
  if (!confirm('¿Borrar todos los votos y empezar de cero?')) return
  elos.value = {}
  counts.value = {}
  voteCount.value = 0
  localStorage.removeItem(STORAGE_KEY)
  pickPair()
}

function exportCsv() {
  const rows = [['rank', 'id_question', 'elo', 'difficulty_original', 'question']]
  rankedQuestions.value.forEach((q, i) => {
    rows.push([i + 1, q.id, getElo(q.id), q.difficulty ?? '', `"${q.texto.replace(/"/g, '""')}"`])
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `difficulty_ranking_${filter.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function rankColor(i, total) {
  const pct = i / (total - 1)
  if (pct < 0.33) return 'text-emerald-600 bg-emerald-50'
  if (pct < 0.66) return 'text-blue-600 bg-blue-50'
  return 'text-red-500 bg-red-50'
}

const rankedQuestions = computed(() =>
  [...activeQuestions.value].sort((a, b) => getElo(b.id) - getElo(a.id))
)

watch(filter, () => { pickPair(); pickSwapPair() })
watch(rankingMode, (m) => { if (m === 'swap') pickSwapPair() })

onMounted(async () => {
  loadStorage()
  ;[allQuestions.value, testQuestions.value] = await Promise.all([getAllQuestions(), getQuestionsInTests()])
  loading.value = false
  pickPair()
  pickSwapPair()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl font-bold text-neutral-800">Votar Dificultad</h2>
        <p class="text-sm text-neutral-500 mt-0.5">{{ voteCount }} comparaciones · {{ activeQuestions.length }} preguntas</p>
      </div>
      <div class="flex gap-2">
        <div class="flex rounded-lg border border-neutral-200 overflow-hidden text-sm">
          <button
            @click="view = 'vote'"
            :class="['px-3 py-1.5 transition-colors', view === 'vote' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-50']"
          >Votar</button>
          <button
            @click="view = 'ranking'"
            :class="['px-3 py-1.5 border-l border-neutral-200 transition-colors', view === 'ranking' ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:bg-neutral-50']"
          >Ranking</button>
        </div>
        <button @click="exportCsv" class="btn-secondary text-sm">Exportar CSV</button>
        <button @click="reset" class="text-sm px-3 py-1.5 rounded text-red-500 hover:bg-red-50 transition-colors">Reiniciar</button>
      </div>
    </div>

    <div class="flex items-center gap-3 mb-4">
      <span class="text-xs text-neutral-500 shrink-0">Mezcla de niveles</span>
      <input type="range" min="50" max="800" step="50" v-model.number="spread" class="flex-1 accent-primary-500" />
      <span class="text-xs font-mono text-neutral-400 w-8 text-right">{{ spread }}</span>
      <span class="text-xs text-neutral-400 shrink-0">estricto ← → amplio</span>
    </div>

    <div class="flex items-center gap-2 mb-6">
      <button v-for="opt in [
        { value: 'all', label: 'Todas', count: allQuestions.length },
        { value: 'tests', label: 'Solo tests', count: testQuestions.length },
        { value: 'no-tests', label: 'Solo no-tests', count: noTestQuestions.length },
      ]" :key="opt.value"
        @click="filter = opt.value"
        :class="['text-sm px-3 py-1 rounded-full border transition-colors', filter === opt.value ? 'bg-primary-500 text-white border-primary-500' : 'text-neutral-500 border-neutral-200 hover:border-neutral-300']"
      >
        {{ opt.label }} ({{ opt.count }})
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-neutral-400">Cargando preguntas…</div>

    <!-- VOTE VIEW -->
    <div v-else-if="view === 'vote'">
      <div class="grid grid-cols-2 gap-4 mb-3">
        <button
          v-for="q in [pairA, pairB]"
          :key="q?.id"
          @click="vote(q.id, 1)"
          class="card text-left border-2 border-transparent hover:border-primary-400 hover:shadow-lg active:scale-95 transition-all cursor-pointer group"
        >
          <div class="text-xs text-neutral-400 mb-2 font-mono">#{{ q?.id }}</div>
          <p class="text-neutral-800 leading-relaxed group-hover:text-primary-600 transition-colors">{{ q?.texto }}</p>
          <div class="mt-3 text-xs text-neutral-400">Elo: {{ getElo(q?.id) }}</div>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button @click="vote(pairA.id, 3)"
          class="py-3 px-4 rounded-lg font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 active:scale-95 transition-all text-sm">
          ← Mucho más difícil
        </button>
        <button @click="voteSimilar"
          class="py-3 px-4 rounded-lg font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 active:scale-95 transition-all text-sm">
          Son similares <span class="text-xs text-neutral-400 ml-1">[espacio]</span>
        </button>
        <button @click="vote(pairB.id, 3)"
          class="py-3 px-4 rounded-lg font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 active:scale-95 transition-all text-sm">
          Mucho más difícil →
        </button>
      </div>

      <div class="flex items-center justify-center gap-2 mt-3">
        <span class="text-xs text-neutral-400 mr-1">Subir ambas:</span>
        <button v-for="n in [20, 50, 100]" :key="n" @click="bumpBoth(n)"
          class="text-xs px-2.5 py-1 rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 transition-colors font-mono"
        >+{{ n }}</button>
      </div>
    </div>

    <!-- RANKING VIEW -->
    <div v-else>
      <div class="flex items-center gap-2 mb-4">
        <button
          v-for="m in [{ value: 'cards', label: 'Cards' }, { value: 'swap', label: 'Intercambiar' }, { value: 'list', label: 'Lista' }]"
          :key="m.value"
          @click="rankingMode = m.value"
          :class="['text-xs px-3 py-1 rounded-full border transition-colors', rankingMode === m.value ? 'bg-neutral-800 text-white border-neutral-800' : 'text-neutral-500 border-neutral-200 hover:border-neutral-300']"
        >{{ m.label }}</button>
      </div>

      <!-- SWAP MODE -->
      <div v-if="rankingMode === 'swap'" class="max-w-2xl mx-auto">
        <p class="text-center text-sm text-neutral-500 mb-5">
          ¿Están en el orden correcto o deberían intercambiarse?
        </p>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div v-for="idx in [swapIdxA, swapIdxB]" :key="rankedQuestions[idx]?.id"
            class="rounded-xl border border-neutral-100 bg-white shadow-sm p-4 flex flex-col gap-2"
          >
            <div class="flex items-center justify-between">
              <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', rankColor(idx, rankedQuestions.length)]">
                #{{ idx + 1 }}
              </span>
              <span class="text-xs font-mono text-neutral-400">{{ getElo(rankedQuestions[idx]?.id) }}</span>
            </div>
            <p class="text-sm text-neutral-700 leading-relaxed flex-1">{{ rankedQuestions[idx]?.texto }}</p>
            <span class="text-xs font-mono text-neutral-300">#{{ rankedQuestions[idx]?.id }}</span>
          </div>
        </div>
        <div class="text-center text-xs text-neutral-400 mb-4">
          Distancia: {{ swapIdxB - swapIdxA }} posiciones ·
          Δelo {{ Math.abs(getElo(rankedQuestions[swapIdxA]?.id) - getElo(rankedQuestions[swapIdxB]?.id)) }}
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button @click="doSwap"
            class="py-3 rounded-xl font-medium bg-primary-500 text-white hover:bg-primary-600 active:scale-95 transition-all text-sm shadow-sm">
            Intercambiar ⇄
          </button>
          <button @click="keepOrder"
            class="py-3 rounded-xl font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 active:scale-95 transition-all text-sm">
            Están bien <span class="text-xs text-neutral-400 ml-1">[espacio]</span>
          </button>
        </div>
      </div>

      <!-- CARDS MODE -->
      <TransitionGroup v-else-if="rankingMode === 'cards'" name="rank" tag="div" class="grid grid-cols-3 gap-3">
        <div
          v-for="(q, i) in rankedQuestions"
          :key="q.id"
          :class="['rounded-xl border p-3 flex flex-col gap-2 transition-all duration-300', lastSwapped === q.id ? 'border-primary-400 shadow-md bg-primary-50/30' : 'border-neutral-100 bg-white shadow-sm']"
        >
          <div class="flex items-start justify-between gap-2">
            <span :class="['text-xs font-bold px-2 py-0.5 rounded-full shrink-0', rankColor(i, rankedQuestions.length)]">
              #{{ i + 1 }}
            </span>
            <span class="text-xs font-mono text-neutral-400 shrink-0">{{ getElo(q.id) }}</span>
          </div>
          <p class="text-xs text-neutral-700 leading-relaxed flex-1">{{ q.texto }}</p>
          <div class="flex items-center justify-between gap-1 pt-1 border-t border-neutral-100">
            <span class="text-xs text-neutral-300 font-mono">#{{ q.id }}</span>
            <div class="flex gap-0.5">
              <button v-for="steps in [3, 2, 1]" :key="`l${steps}`"
                @click="swapElos(i, i - steps)"
                :disabled="i < steps"
                class="h-6 px-1.5 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90 text-xs font-mono"
                :title="`Subir ${steps}`"
              >{{ '←'.repeat(steps) }}</button>
              <div class="w-px bg-neutral-100 mx-0.5"></div>
              <button v-for="steps in [1, 2, 3]" :key="`r${steps}`"
                @click="swapElos(i, i + steps)"
                :disabled="i + steps >= rankedQuestions.length"
                class="h-6 px-1.5 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90 text-xs font-mono"
                :title="`Bajar ${steps}`"
              >{{ '→'.repeat(steps) }}</button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- LIST MODE -->
      <div v-else-if="rankingMode === 'list'" class="space-y-1">
        <div
          v-for="(q, i) in rankedQuestions"
          :key="q.id"
          class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50"
        >
          <span class="text-sm font-mono text-neutral-400 w-6 text-right">{{ i + 1 }}</span>
          <span class="text-xs font-mono text-neutral-300 w-8">#{{ q.id }}</span>
          <span class="flex-1 text-sm text-neutral-700">{{ q.texto }}</span>
          <div class="flex gap-1 shrink-0">
            <button @click="swapElos(i, i - 1)" :disabled="i === 0"
              class="w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs">←</button>
            <button @click="swapElos(i, i + 1)" :disabled="i === rankedQuestions.length - 1"
              class="w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs">→</button>
          </div>
          <span class="text-xs font-mono text-neutral-500 w-12 text-right">{{ getElo(q.id) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rank-move {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.rank-enter-active, .rank-leave-active {
  transition: all 0.35s ease;
}
.rank-enter-from, .rank-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
