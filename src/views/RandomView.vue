<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { useTimer } from '@/composables/useTimer'
import { getRandomPlayQuestion } from '@/lib/questions'
import { savePlayResponse } from '@/lib/supabase'
import QuestionCard from '@/components/common/QuestionCard.vue'
import LogErrorModal from '@/components/common/LogErrorModal.vue'
import { useMobile } from '@/composables/useMobile'
import { colors, testDifficulties } from '@/config/difficulties.js'

const { isMobile } = useMobile()

const QUESTION_TIME = 180
const WARNING_TIME = 30

const currentQuestion = ref(null)
const currentAnswer = ref('')
const showResult = ref(false)
const skipped = ref(false)
const isLoading = ref(true)
const questionCardRef = ref(null)
const showLogErrorModal = ref(false)
const timerShaking = ref(false)
const warningPlayed = ref(false)

const { formatNumber, formatRange, cleanInput } = useNumberFormat()
const { formattedTime, seconds: timeRemaining, start: startTimer, stop: stopTimer, reset: resetTimer, getElapsedTime } = useTimer(QUESTION_TIME, () => {})

watch(timeRemaining, (remaining) => {
  if (remaining <= WARNING_TIME && remaining > 0 && !warningPlayed.value) {
    warningPlayed.value = true
    timerShaking.value = true
    playWarningSound()
    setTimeout(() => { timerShaking.value = false }, 1000)
  }
})

function playWarningSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 440
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (e) {
    console.log('No se pudo reproducir sonido:', e)
  }
}

const hasRange = computed(() => {
  const q = currentQuestion.value
  return q && q.p05 != null && q.p95 != null
})

const correctRange = computed(() => {
  if (!hasRange.value) return null
  return { min: currentQuestion.value.p05, max: currentQuestion.value.p95 }
})

const formattedAnswer = computed(() => {
  const cleaned = cleanInput(currentAnswer.value)
  if (!cleaned) return '—'
  return formatNumber(parseInt(cleaned, 10))
})

const answerNum = computed(() => {
  const cleaned = cleanInput(currentAnswer.value)
  if (!cleaned) return null
  return parseInt(cleaned, 10)
})

const isInRange = computed(() => {
  const n = answerNum.value
  const r = correctRange.value
  if (n === null || !r) return false
  return n >= r.min && n <= r.max
})

const closestBound = computed(() => {
  const n = answerNum.value
  const r = correctRange.value
  if (n === null || !r || isInRange.value) return null
  if (n < r.min) return r.min
  return r.max
})

const offFactor = computed(() => {
  const n = answerNum.value
  const r = correctRange.value
  if (n === null || n <= 0 || !r || isInRange.value) return null
  if (n < r.min) return r.min / n
  return n / r.max
})

const logError = computed(() => {
  const n = answerNum.value
  if (n === null || n <= 0 || !hasRange.value) return null
  if (isInRange.value) return 0
  return Math.abs(Math.log10(n / closestBound.value))
})

const isAnswerComplete = computed(() => {
  return cleanInput(currentAnswer.value) !== ''
})

const currentDifficulty = computed(() => {
  const d = currentQuestion.value?.difficulty
  if (d == null) return null
  return testDifficulties[Math.min(Math.max(Math.round(d) - 1, 0), testDifficulties.length - 1)]
})

function formatFactor(f) {
  if (f >= 100) return Math.round(f).toLocaleString('es-ES')
  if (f >= 10) return Math.round(f).toString()
  return f.toFixed(1)
}

async function getNewQuestion() {
  isLoading.value = true
  currentQuestion.value = await getRandomPlayQuestion()
  currentAnswer.value = ''
  showResult.value = false
  skipped.value = false
  isLoading.value = false
  warningPlayed.value = false
  timerShaking.value = false
  resetTimer(QUESTION_TIME)
  startTimer()
}

function handleSkip() {
  stopTimer()
  skipped.value = true
  showResult.value = true
}

onMounted(() => {
  getNewQuestion()
})

async function handleSubmit() {
  if (!isAnswerComplete.value) return
  stopTimer()
  showResult.value = true

  try {
    const cleaned = cleanInput(currentAnswer.value)
    await savePlayResponse({
      idPlayQuestion: currentQuestion.value.id,
      response: cleaned ? parseInt(cleaned, 10) : null,
      time: getElapsedTime()
    })
  } catch (e) {
    console.error('Error guardando respuesta play:', e)
  }
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8" :class="{ 'pb-[280px]': isMobile }">
    <RouterLink to="/" class="inline-block mb-6 text-primary-500 hover:text-primary-600 transition-colors">
      ← Volver al inicio
    </RouterLink>

    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-800">
          Estima 🧐
        </h1>
      </div>

      <div class="card-elevated">

        <div v-if="isLoading" class="text-center py-8">
          <p class="text-neutral-500">Cargando pregunta...</p>
        </div>

        <template v-else>
        <div v-if="!showResult" class="space-y-6">
          <div class="flex items-center justify-between">
            <span v-if="currentDifficulty" class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="colors[currentDifficulty.color].badge">
              {{ currentDifficulty.level }}
            </span>
            <span v-else></span>
            <span class="timer-toggle" :class="{ 'timer-shaking': timerShaking }">
              <span class="timer-icon">⏱️</span>
              <span class="timer-value">{{ formattedTime }}</span>
            </span>
          </div>
          <QuestionCard
            ref="questionCardRef"
            :question-text="currentQuestion?.texto ?? ''"
            note-text="Tómate tu tiempo y haz tus cuentas."
            v-model="currentAnswer"
            submit-label="Ver resultado"
            mobile-submit-label="Enviar"
            :submit-disabled="!isAnswerComplete"
            show-skip
            @submit="handleSubmit"
            @skip="handleSkip"
          />
        </div>

        <div v-else class="space-y-5">
          <h2 class="text-xl font-medium text-neutral-800 leading-relaxed">
            {{ currentQuestion?.texto }}
          </h2>
          <div class="grid gap-4" :class="skipped ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-1 sm:grid-cols-2'">
            <div v-if="!skipped" class="bg-neutral-50 rounded-2xl p-5 text-center">
              <p class="text-sm text-neutral-500 mb-2">Tu estimación</p>
              <p class="text-2xl font-bold text-neutral-800">
                {{ formattedAnswer }}
              </p>
            </div>
            <div v-if="hasRange" class="bg-neutral-50 rounded-2xl p-5 text-center">
              <p class="text-sm text-neutral-500 mb-2">Respuesta correcta</p>
              <p class="text-2xl font-bold text-neutral-800">
                {{ formatRange(correctRange.min, correctRange.max) }}
              </p>
            </div>
          </div>

          <template v-if="hasRange && !skipped">
            <div
              class="rounded-2xl p-6 text-center"
              :class="isInRange ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'"
            >
              <template v-if="isInRange">
                <p class="text-2xl font-bold text-emerald-700 mb-1">¡Muy bien! 🎯</p>
                <p class="text-emerald-600">Tu estimación está en el rango correcto</p>
              </template>
              <template v-else>
                <p class="text-2xl font-bold text-amber-700 mb-1">¡Uiii! 😬</p>
                <p class="text-amber-600">
                  <template v-if="answerNum < correctRange.min">
                    Te quedaste corto
                  </template>
                  <template v-else>
                    Te pasaste
                  </template>
                </p>
              </template>

              <div
                class="mt-4 pt-4 border-t"
                :class="isInRange ? 'border-emerald-200' : 'border-amber-200'"
              >
                <p class="text-sm text-neutral-600">
                  Error logarítmico: <span class="font-bold text-neutral-800">{{ logError !== null ? logError.toFixed(1) : '—' }}</span>
                </p>
                <button
                  @click="showLogErrorModal = true"
                  class="text-sm text-primary-500 hover:text-primary-600 underline underline-offset-2 mt-1 cursor-pointer"
                >
                  ¿Qué es el error logarítmico?
                </button>
              </div>
            </div>
          </template>
          
          <button
            @click="getNewQuestion"
            class="btn-primary btn-large w-full"
          >
            Otra pregunta
          </button>
        </div>
        </template>
      </div>
    </div>

    <LogErrorModal :show="showLogErrorModal" @close="showLogErrorModal = false" />
  </div>
</template>

<style scoped>
@reference "../assets/main.css";

.timer-toggle {
  @apply flex items-center gap-1 px-2 py-1 rounded-lg;
  @apply bg-neutral-100 transition-all duration-200;
}

.timer-icon {
  @apply text-lg transition-transform duration-200;
}

.timer-value {
  @apply font-mono text-sm text-neutral-600;
}

.timer-shaking {
  @apply scale-125;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0) scale(1.25); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px) scale(1.25); }
  20%, 40%, 60%, 80% { transform: translateX(2px) scale(1.25); }
}
</style>
