<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { useTimer } from '@/composables/useTimer'
import { getRandomPlayQuestion } from '@/lib/questions'
import { savePlayResponse } from '@/lib/supabase'
import FermiInput from '@/components/common/FermiInput.vue'

const currentQuestion = ref(null)
const currentAnswer = ref('')
const showResult = ref(false)
const isLoading = ref(true)
const fermiInputRef = ref(null)
const showLogErrorModal = ref(false)

const { formatNumber, cleanInput } = useNumberFormat()
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
                <template v-if="correctRange.min === correctRange.max">{{ formatNumber(correctRange.min) }}</template>
                <template v-else>{{ formatNumber(correctRange.min) }} – {{ formatNumber(correctRange.max) }}</template>
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
                  Error logarítmico: <span class="font-bold text-neutral-800">{{ logError !== null ? logError.toFixed(2) : '—' }}</span>
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

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showLogErrorModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showLogErrorModal = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 transform">
            <button
              @click="showLogErrorModal = false"
              class="absolute top-3 right-3 bg-neutral-100 rounded-full p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 class="text-2xl font-bold text-neutral-800 mb-4">Error logarítmico 📏</h2>

            <p class="text-neutral-600 leading-relaxed mb-2">
              Es el error en el <strong>número de cifras</strong>.
              Si tú dices 1.000 y el resultado es 100.000, tu error logarítmico es 2.
            </p>
            <p class="text-neutral-600 leading-relaxed mb-4">
              En los problemas de Fermi, lo que importa no es el resultado exacto, sino el <strong>orden de magnitud</strong> (el número de cifras). Por eso medimos el error en esta escala logarítmica.
            </p>

            <div class="bg-neutral-50 rounded-xl p-4 sm:p-5 mb-5">
              <svg viewBox="0 0 460 130" class="w-full" xmlns="http://www.w3.org/2000/svg">
                <line x1="30" y1="75" x2="430" y2="75" stroke="#a3a3a3" stroke-width="1.5"/>
                <line x1="30" y1="68" x2="30" y2="82" stroke="#525252" stroke-width="2"/>
                <text x="30" y="100" text-anchor="middle" font-size="12" fill="#525252">1</text>
                <text x="30" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10⁰</text>
                <line x1="110" y1="68" x2="110" y2="82" stroke="#525252" stroke-width="2"/>
                <text x="110" y="100" text-anchor="middle" font-size="12" fill="#525252">10</text>
                <text x="110" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10¹</text>
                <line x1="190" y1="68" x2="190" y2="82" stroke="#525252" stroke-width="2"/>
                <text x="190" y="100" text-anchor="middle" font-size="12" fill="#525252">100</text>
                <text x="190" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10²</text>
                <line x1="270" y1="68" x2="270" y2="82" stroke="#525252" stroke-width="2"/>
                <text x="270" y="100" text-anchor="middle" font-size="12" fill="#525252">1.000</text>
                <text x="270" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10³</text>
                <line x1="350" y1="68" x2="350" y2="82" stroke="#525252" stroke-width="2"/>
                <text x="350" y="100" text-anchor="middle" font-size="12" fill="#525252">10.000</text>
                <text x="350" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10⁴</text>
                <line x1="430" y1="68" x2="430" y2="82" stroke="#525252" stroke-width="2"/>
                <text x="430" y="100" text-anchor="middle" font-size="12" fill="#525252">100.000</text>
                <text x="430" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10⁵</text>
                <circle cx="270" cy="48" r="6" fill="#f59e0b"/>
                <text x="270" y="32" text-anchor="middle" font-size="10" font-weight="bold" fill="#d97706">Tú: 1.000</text>
                <circle cx="430" cy="48" r="6" fill="#10b981"/>
                <text x="430" y="32" text-anchor="middle" font-size="10" font-weight="bold" fill="#059669">Real: 100.000</text>
                <line x1="278" y1="48" x2="422" y2="48" stroke="#6366f1" stroke-width="2" stroke-dasharray="5"/>
                <text x="350" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#6366f1">Error = 2</text>
              </svg>
            </div>

            <div class="space-y-2 text-neutral-600">
              <p><strong>Error = 0</strong> → acertaste</p>
              <p><strong>Error = 1</strong> → te equivocaste por un factor de 10</p>
              <p><strong>Error = 2</strong> → te equivocaste por un factor de 100</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
