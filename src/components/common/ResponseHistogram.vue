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

  let extraLeft = BIN_SIZE
  let extraRight = BIN_SIZE

  if (allLogs.length) {
    const dataMin = Math.min(...allLogs)
    const dataMax = Math.max(...allLogs)
    extraLeft = Math.max(rMin - dataMin, BIN_SIZE)
    extraRight = Math.max(dataMax - rMax, BIN_SIZE)
  }

  const extra = Math.max(extraLeft, extraRight)
  const finalMin = Math.floor((rMin - extra) / BIN_SIZE) * BIN_SIZE
  const finalMax = Math.ceil((rMax + extra) / BIN_SIZE) * BIN_SIZE
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
const PAD = { top: 20, right: 12, bottom: 36, left: 12 }
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
    ticks.push({ x: logToX(p), label: formatTick(Math.pow(10, p)) })
  }
  return ticks
})

const userLogError = computed(() => {
  if (!props.userAnswer || !props.correctRange) return null
  return computeLogError(props.userAnswer)
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
      <p class="text-sm font-semibold text-neutral-700">¿Cómo te comparas?</p>
      <p class="text-xs text-neutral-400">{{ validResponses.length }} jugador{{ validResponses.length !== 1 ? 'es' : '' }}</p>
    </div>

    <div class="bg-neutral-50 rounded-2xl p-3">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" style="overflow: visible">
        <!-- Correct range band -->
        <rect
          v-if="correctRangeRect"
          :x="correctRangeRect.x"
          :y="PAD.top"
          :width="correctRangeRect.width"
          :height="chartH"
          fill="#bbf7d0"
          rx="3"
        />

        <!-- Bars -->
        <rect
          v-for="(bar, i) in barsData"
          :key="i"
          :x="bar.x"
          :width="bar.width"
          :y="bar.count === 0 ? PAD.top + chartH : bar.y"
          :height="bar.count === 0 ? 0 : bar.height"
          :fill="bar.isUserBin ? '#0ea5e9' : '#c4c4c4'"
          rx="2"
          class="histogram-bar"
          :style="{ animationDelay: `${i * 30}ms` }"
        />

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
    <div v-if="percentileWorse !== null" class="text-center text-sm text-neutral-500 pt-1">
      El <span class="font-bold text-neutral-700">{{ percentileWorse }}%</span> de jugadores lo hizo peor que tú
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
