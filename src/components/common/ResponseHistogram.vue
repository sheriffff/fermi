<script setup>
import { computed } from 'vue'
import { useNumberFormat } from '@/composables/useNumberFormat'

const props = defineProps({
  responses: { type: Array, default: () => [] },
  userAnswer: { type: Number, default: null },
  correctRange: { type: Object, default: null }
})

const { formatNumber } = useNumberFormat()

const BIN_SIZE = 0.5

function formatTick(n) {
  if (n >= 1e6) return formatNumber(n)
  return Math.round(n).toLocaleString('es-ES')
}

function computeLogError(response) {
  if (!props.correctRange || response <= 0) return null
  const { min, max } = props.correctRange
  if (response >= min && response <= max) return 0
  if (response < min) return Math.log10(min / response)
  return Math.log10(response / max)
}

const validResponses = computed(() => props.responses.filter(r => r > 0))

const binRange = computed(() => {
  const allLogs = [...validResponses.value.map(v => Math.log10(v))]
  if (props.userAnswer > 0) allLogs.push(Math.log10(props.userAnswer))

  if (!props.correctRange) {
    if (!allLogs.length) return { min: 0, max: 6 }
    const minLog = Math.floor(Math.min(...allLogs) / BIN_SIZE) * BIN_SIZE - BIN_SIZE
    const maxLog = Math.ceil(Math.max(...allLogs) / BIN_SIZE) * BIN_SIZE + BIN_SIZE
    return { min: minLog, max: maxLog }
  }

  const rMin = Math.log10(props.correctRange.min)
  const rMax = Math.log10(props.correctRange.max)
  const finalMin = Math.floor((rMin - 3) / BIN_SIZE) * BIN_SIZE
  const finalMax = Math.ceil((rMax + 3) / BIN_SIZE) * BIN_SIZE
  return { min: finalMin, max: finalMax }
})

const bins = computed(() => {
  const { min, max } = binRange.value
  const result = []
  for (let log = min; log < max - 0.001; log += BIN_SIZE) {
    const binMin = Math.pow(10, log)
    const binMax = Math.pow(10, log + BIN_SIZE)
    const count = validResponses.value.filter(r => r >= binMin && r < binMax).length
    const isUserBin = props.userAnswer > 0 && props.userAnswer >= binMin && props.userAnswer < binMax
    result.push({ log, binMin, binMax, count, isUserBin })
  }
  return result
})

const maxCount = computed(() => Math.max(...bins.value.map(b => b.count), 1))

const W = 560
const H = 170
const PAD = { top: 20, right: 12, bottom: 48, left: 12 }
const chartW = W - PAD.left - PAD.right
const chartH = H - PAD.top - PAD.bottom

function logToX(log) {
  const { min, max } = binRange.value
  return PAD.left + ((log - min) / (max - min)) * chartW
}

const barsData = computed(() => bins.value.map(b => {
  const x = logToX(b.log) + 1
  const w = Math.max(logToX(b.log + BIN_SIZE) - logToX(b.log) - 2, 2)
  const h = (b.count / maxCount.value) * chartH
  return { x, width: w, y: PAD.top + chartH - h, height: h, isUserBin: b.isUserBin, count: b.count }
}))

const correctRangeRect = computed(() => {
  if (!props.correctRange) return null
  const x1 = logToX(Math.log10(props.correctRange.min))
  const x2 = logToX(Math.log10(props.correctRange.max))
  return { x: x1, width: Math.max(x2 - x1, 4) }
})

const userLineX = computed(() => {
  if (!props.userAnswer || props.userAnswer <= 0) return null
  return logToX(Math.log10(props.userAnswer))
})

const xTicks = computed(() => {
  const { min, max } = binRange.value
  const ticks = []
  for (let p = Math.ceil(min); p <= Math.floor(max); p++) {
    ticks.push({ x: logToX(p), label: formatTick(Math.pow(10, p)), exp: p })
  }
  return ticks
})

const userLogError = computed(() => {
  if (!props.userAnswer || !props.correctRange) return null
  return computeLogError(props.userAnswer)
})

const userIsCorrect = computed(() => {
  if (!props.userAnswer || !props.correctRange) return null
  return props.userAnswer >= props.correctRange.min && props.userAnswer <= props.correctRange.max
})

const percentCorrect = computed(() => {
  if (!props.correctRange || !validResponses.value.length) return null
  const { min, max } = props.correctRange
  const correct = validResponses.value.filter(r => r >= min && r <= max).length
  return Math.round((correct / validResponses.value.length) * 100)
})

const percentileWorse = computed(() => {
  if (userLogError.value === null || !validResponses.value.length) return null
  const myError = userLogError.value
  const worse = validResponses.value.filter(r => {
    const err = computeLogError(r)
    return err !== null && err > myError
  }).length
  return Math.round((worse / validResponses.value.length) * 100)
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-neutral-700">¿Lo hiciste mejor que el resto?</p>
      <p class="text-xs text-neutral-400">{{ validResponses.length }} jugador{{ validResponses.length !== 1 ? 'es' : '' }}</p>
    </div>

    <div class="bg-neutral-50 rounded-2xl p-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" style="overflow: visible">
        <defs>
          <linearGradient id="rangeHalo" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stop-color="#22c55e" stop-opacity="0"/>
            <stop offset="25%"  stop-color="#22c55e" stop-opacity="0.28"/>
            <stop offset="50%"  stop-color="#22c55e" stop-opacity="0.38"/>
            <stop offset="75%"  stop-color="#22c55e" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="fadeLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stop-color="#f5f5f5" stop-opacity="1"/>
            <stop offset="100%" stop-color="#f5f5f5" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stop-color="#f5f5f5" stop-opacity="0"/>
            <stop offset="100%" stop-color="#f5f5f5" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <!-- Bars -->
        <rect
          v-for="(bar, i) in barsData"
          :key="i"
          :x="bar.x"
          :width="bar.width"
          :y="bar.count === 0 ? PAD.top + chartH : bar.y"
          :height="bar.count === 0 ? 0 : bar.height"
          fill="#c4c4c4"
          rx="2"
          class="histogram-bar"
          :style="{ animationDelay: `${i * 30}ms` }"
        />

        <!-- Correct range band (halo, sin borde) -->
        <rect
          v-if="correctRangeRect"
          :x="correctRangeRect.x"
          :y="0"
          :width="correctRangeRect.width"
          :height="PAD.top + chartH"
          fill="url(#rangeHalo)"
        />

        <!-- Edge fades -->
        <rect :x="PAD.left" :y="PAD.top" :width="chartW * 0.12" :height="chartH" fill="url(#fadeLeft)" />
        <rect :x="PAD.left + chartW * 0.88" :y="PAD.top" :width="chartW * 0.12" :height="chartH" fill="url(#fadeRight)" />

        <!-- User answer vertical line -->
        <line
          v-if="userLineX"
          :x1="userLineX"
          :x2="userLineX"
          :y1="PAD.top - 10"
          :y2="PAD.top + chartH"
          stroke="#0ea5e9"
          stroke-width="2"
          stroke-dasharray="4,3"
          opacity="0.7"
        />

        <!-- "Tú" label -->
        <text
          v-if="userLineX"
          :x="userLineX"
          :y="PAD.top - 13"
          text-anchor="middle"
          font-size="11"
          fill="#0ea5e9"
          font-weight="700"
          font-family="system-ui, sans-serif"
        >Tú</text>

        <!-- Axis baseline -->
        <line
          :x1="PAD.left"
          :x2="PAD.left + chartW"
          :y1="PAD.top + chartH"
          :y2="PAD.top + chartH"
          stroke="#d4d4d4"
          stroke-width="1"
        />

        <!-- X ticks + labels -->
        <g v-for="tick in xTicks" :key="tick.x">
          <line
            :x1="tick.x"
            :x2="tick.x"
            :y1="PAD.top + chartH"
            :y2="PAD.top + chartH + 5"
            stroke="#a3a3a3"
            stroke-width="1"
          />
          <text
            :x="tick.x"
            :y="PAD.top + chartH + 17"
            text-anchor="middle"
            font-size="10"
            fill="#737373"
            font-family="system-ui, sans-serif"
          >{{ tick.label }}</text>
          <text
            :x="tick.x"
            :y="PAD.top + chartH + 29"
            text-anchor="middle"
            font-size="10"
            fill="#888888"
            font-family="system-ui, sans-serif"
          >10<tspan dy="-4" font-size="7">{{ tick.exp }}</tspan></text>
        </g>
      </svg>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-5 text-xs text-neutral-500 px-1">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm bg-green-200"></div>
        <span>Rango correcto</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm bg-primary-400"></div>
        <span>Tu respuesta</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm bg-neutral-300"></div>
        <span>Otros jugadores</span>
      </div>
    </div>

    <!-- Percentile message -->
    <div class="text-center text-sm text-neutral-500 pt-1 space-y-0.5">
      <div v-if="percentCorrect !== null">
        <template v-if="userIsCorrect">
          Esta pregunta la acertáis tan solo el <span class="font-bold text-neutral-700">{{ percentCorrect }}%</span> de jugadores!
        </template>
        <template v-else>
          Esta pregunta la acierta sólo el <span class="font-bold text-neutral-700">{{ percentCorrect }}%</span> de los jugadores.
        </template>
      </div>
      <div v-if="!userIsCorrect && percentileWorse !== null">
        <template v-if="percentileWorse >= 30">
          Tú no acertaste. Aun así, lo hiciste mejor que el <span class="font-bold text-neutral-700">{{ percentileWorse }}%</span> de jugadores.
        </template>
        <template v-else>
          Tú no acertaste. De hecho, lo hiciste peor que el <span class="font-bold text-neutral-700">{{ 100 - percentileWorse }}%</span> de jugadores.
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../../assets/main.css";

.histogram-bar {
  transform-origin: bottom;
  transform-box: fill-box;
  animation: bar-rise 0.4s ease-out both;
}

@keyframes bar-rise {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}
</style>
