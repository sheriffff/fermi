<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { useTimer } from '@/composables/useTimer'
import { getRandomPlayQuestion } from '@/lib/questions'
import { savePlayResponse } from '@/lib/supabase'
import FermiInput from '@/components/common/FermiInput.vue'
import LogErrorModal from '@/components/common/LogErrorModal.vue'

const currentQuestion = ref(null)
const currentAnswer = ref('')
const showResult = ref(false)
const isLoading = ref(true)
const fermiInputRef = ref(null)
const showLogErrorModal = ref(false)

const { formatNumber, formatRange, cleanInput } = useNumberFormat()
const { start: startTimer, stop: stopTimer, reset: resetTimer, getElapsedTime } = useTimer(9999)

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
  isLoading.value = false
  resetTimer(9999)
  startTimer()
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
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
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
        <div class="mb-8">
          <h2 class="text-xl font-medium text-neutral-800 leading-relaxed">
            {{ currentQuestion?.texto }}
          </h2>
        </div>

        <div v-if="!showResult" class="space-y-6">
          <FermiInput
            ref="fermiInputRef"
            v-model="currentAnswer"
            @submit="isAnswerComplete && handleSubmit()"
          />

          <button
            @click="handleSubmit"
            class="btn-primary btn-large w-full"
            :disabled="!isAnswerComplete"
          >
            Ver resultado
          </button>

          <button
            @click="getNewQuestion"
            class="btn-outline btn-large w-full"
          >
            Paso, otra pregunta
          </button>
        </div>

        <div v-else class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-neutral-50 rounded-2xl p-5 text-center">
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

          <template v-if="hasRange">
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

