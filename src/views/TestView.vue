<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useTimer } from '@/composables/useTimer'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { useTestResults } from '@/composables/useTestResults'
import { useMobile } from '@/composables/useMobile'
import { createUserOnline, saveResponsesOnline } from '@/lib/supabase'
import { colors, getDifficulty } from '@/config/difficulties.js'
import { getTestQuestions, getAvailableTests } from '@/lib/questions'
import BackButton from '@/components/common/BackButton.vue'
import QuestionCard from '@/components/common/QuestionCard.vue'
import InstructionsCard from '@/components/common/InstructionsCard.vue'
import FeedbackButton from '@/components/common/FeedbackButton.vue'
import ShareButton from '@/components/common/ShareButton.vue'
import ResponseHistogram from '@/components/common/ResponseHistogram.vue'
import LogErrorModal from '@/components/common/LogErrorModal.vue'
import ScoreExplanationModal from '@/components/common/ScoreExplanationModal.vue'
import ScribbleUpload from '@/components/adultos/ScribbleUpload.vue'
import TestMetadataForm from '@/components/adultos/TestMetadataForm.vue'

const { isMobile } = useMobile()
const { formatNumber, formatRange, cleanInput } = useNumberFormat()

const QUESTION_TIME = 180
const WARNING_TIME = 30

// ============================================
// ESTADO DEL FLUJO
// ============================================
const currentStep = ref('metadata') // 'metadata' | 'instructions' | 'test' | 'finished'
const isLoading = ref(false)
const error = ref(null)
const savedUserId = ref(null)
const savedMetadata = ref(null)
const savedCodigoGrupo = ref('')
const showLogErrorModal = ref(false)
const showScoreModal = ref(false)
const showUpload = ref(false)
const showResults = ref(false)

// ============================================
// ESTADO DEL TEST
// ============================================
const preguntas = ref([])
const currentQuestionIndex = ref(0)
const respuestas = ref({})
const tiempos = ref({})
const modeloAsignado = ref('')
const currentAnswer = ref('')
const questionCardRef = ref(null)

const currentQuestion = computed(() => preguntas.value[currentQuestionIndex.value] || null)
const questionNumber = computed(() => currentQuestionIndex.value + 1)
const totalQuestions = computed(() => preguntas.value.length)
const progressPercent = computed(() => {
  if (totalQuestions.value === 0) return 0
  return (currentQuestionIndex.value / totalQuestions.value) * 100
})
const currentDifficulty = computed(() => getDifficulty(currentQuestion.value?.difficulty) ?? getDifficulty(1))
const isAnswerComplete = computed(() => cleanInput(currentAnswer.value) !== '')

// ============================================
// RESULTADOS
// ============================================
const { resultsData, finalScore, avgLogErr, isLoadingResponses, fetchAllResponses, logErrBg, logErrLabel, logErrValueClass } = useTestResults(preguntas, respuestas)

// ============================================
// TIMER
// ============================================
const showTimeWarning = ref(false)
const warningPlayed = ref(false)
const timerShaking = ref(false)
const timerVisible = ref(false)

const {
  formattedTime,
  seconds: timeRemaining,
  start: startTimer,
  stop: stopTimer,
  reset: resetTimer,
  getElapsedTime
} = useTimer(QUESTION_TIME, handleTimeUp)

watch(timeRemaining, (remaining) => {
  if (remaining <= WARNING_TIME && remaining > 0 && !warningPlayed.value) {
    showTimeWarning.value = true
    warningPlayed.value = true
    timerShaking.value = true
    timerVisible.value = true
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

// ============================================
// HANDLERS
// ============================================
async function handleMetadataSubmit({ metadata, codigoGrupo }) {
  isLoading.value = true
  error.value = null
  savedMetadata.value = metadata
  savedCodigoGrupo.value = codigoGrupo

  try {
    const availableTests = await getAvailableTests()
    let modelo

    if (metadata.mismoTest) {
      modelo = codigoGrupo
    } else if (metadata.segundaVez === true && metadata.modelosYaHechos.length > 0) {
      const disponibles = availableTests.filter(m => !metadata.modelosYaHechos.includes(m))
      modelo = disponibles.length > 0
        ? disponibles[Math.floor(Math.random() * disponibles.length)]
        : availableTests[Math.floor(Math.random() * availableTests.length)]
    } else {
      modelo = availableTests[Math.floor(Math.random() * availableTests.length)]
    }

    modeloAsignado.value = modelo
    preguntas.value = await getTestQuestions(modelo)

    if (!preguntas.value || preguntas.value.length === 0) {
      throw new Error('No se encontraron preguntas para este test')
    }

    currentQuestionIndex.value = 0
    respuestas.value = {}
    tiempos.value = {}
    currentAnswer.value = ''
    currentStep.value = 'instructions'

  } catch (e) {
    console.error('Error iniciando test:', e)
    error.value = 'Error al cargar las preguntas. Por favor, inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}

function startQuestions() {
  currentStep.value = 'test'
  showTimeWarning.value = false
  warningPlayed.value = false
  timerShaking.value = false
  resetTimer(QUESTION_TIME)
  startTimer()
}

function handleTimeUp() {
  saveCurrentAnswer()
  goToNextQuestion()
}

function handleSubmitAnswer() {
  saveCurrentAnswer()
  goToNextQuestion()
}

function saveCurrentAnswer() {
  const key = `p${currentQuestionIndex.value + 1}`
  const cleaned = cleanInput(currentAnswer.value)
  respuestas.value[key] = cleaned ? parseInt(cleaned, 10) : null
  tiempos.value[key] = getElapsedTime()
}

async function goToNextQuestion() {
  stopTimer()

  if (currentQuestionIndex.value < preguntas.value.length - 1) {
    currentQuestionIndex.value++
    currentAnswer.value = ''
    showTimeWarning.value = false
    warningPlayed.value = false
    timerShaking.value = false
    await nextTick()
    resetTimer(QUESTION_TIME)
    startTimer()
  } else {
    await finishTest()
  }
}

async function finishTest() {
  isLoading.value = true
  try {
    const m = savedMetadata.value
    const userId = await createUserOnline({
      age: parseInt(m.edad),
      piVsE: m.piVsE,
      whichTestsBefore: m.modelosYaHechos.join(''),
      userAlias: m.codigoPersonal,
      testModel: modeloAsignado.value,
      amigosTest: m.mismoTest ? savedCodigoGrupo.value : null,
      email: m.email || null
    })

    const rows = Object.keys(respuestas.value).map(key => ({
      questionN: parseInt(key.replace('p', ''), 10),
      response: respuestas.value[key],
      time: tiempos.value[key]
    }))

    await saveResponsesOnline(userId, modeloAsignado.value, rows)
    savedUserId.value = userId
  } catch (e) {
    console.error('Error guardando respuestas:', e)
  } finally {
    isLoading.value = false
    currentStep.value = 'finished'
  }
  fetchAllResponses()
}

function focusInput() {
  questionCardRef.value?.focusInput()
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
    <BackButton />

    <div class="max-w-2xl mx-auto">

      <Transition name="fade" mode="out-in">

        <div v-if="currentStep === 'metadata'" key="metadata">
          <TestMetadataForm :is-loading="isLoading" :error="error" @submit="handleMetadataSubmit" />
        </div>

        <div v-else-if="currentStep === 'instructions'" key="instructions">
          <InstructionsCard :question-time="QUESTION_TIME" :warning-time="WARNING_TIME" @start="startQuestions" />
        </div>

        <div v-else-if="currentStep === 'test'" key="test" class="space-y-6" :class="{ 'pb-[280px]': isMobile }">

          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-neutral-500 font-medium">Pregunta {{ questionNumber }} de {{ totalQuestions }}</span>
            <span
              class="timer-toggle cursor-pointer select-none"
              :class="{ 'timer-shaking': timerShaking }"
              @click="timerVisible = !timerVisible"
            >
              <span class="timer-icon">⏱️</span>
              <span v-if="timerVisible" class="timer-value">{{ formattedTime }}</span>
            </span>
          </div>

          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: `${progressPercent}%` }"></div>
          </div>

          <Transition name="slide" mode="out-in" @after-enter="focusInput">
            <div :key="currentQuestionIndex" class="card-elevated">
              <div class="mb-4">
                <span class="text-xs text-neutral-400 mr-1.5">Dificultad:</span>
                <span class="inline text-xs font-semibold px-2.5 py-1 rounded-full" :class="colors[currentDifficulty.color].badge">
                  {{ currentDifficulty.level }}
                </span>
              </div>
              <QuestionCard
                ref="questionCardRef"
                :question-text="currentQuestion?.texto ?? ''"
                :unit-text="currentQuestion?.unidad ?? ''"
                v-model="currentAnswer"
                :submit-label="questionNumber === totalQuestions ? 'Finalizar Test' : 'Siguiente Pregunta →'"
                :submit-disabled="!isAnswerComplete"
                :is-last-question="questionNumber === totalQuestions"
                @submit="handleSubmitAnswer"
              />
            </div>
          </Transition>
        </div>

        <div v-else-if="currentStep === 'finished'" key="finished" class="text-center">

          <Transition name="fade">
            <div v-if="finalScore || isLoadingResponses" class="card text-center mb-4">
              <template v-if="finalScore">
                <p class="text-sm text-neutral-500 mb-1">Tu nota</p>
                <p class="text-5xl font-bold text-primary-600">{{ finalScore }}</p>
                <p class="text-xs text-neutral-400 mt-1">/ 10 · basada en tu percentil vs la población</p>
                <button @click="showScoreModal = true" class="mt-3 text-xs text-primary-500 hover:text-primary-700 underline underline-offset-2 transition-colors">
                  ¿Cómo se calcula la nota?
                </button>
              </template>
              <template v-else>
                <p class="text-sm text-neutral-400">Calculando tu nota...</p>
              </template>
            </div>
          </Transition>

          <div class="card-elevated py-12">
            <div class="text-6xl mb-6">🎉</div>
            <h1 class="text-3xl font-bold text-neutral-800 mb-4">¡Gracias por participar!</h1>
            <div class="flex flex-col items-center gap-3">
              <button v-if="savedUserId" @click="showUpload = true" class="btn-outline btn-large w-full max-w-xs">
                📸 Sube una foto de tu hoja en sucio!
              </button>
              <button v-if="!showResults" @click="showResults = true" class="btn-outline btn-large w-full max-w-xs">
                📝 Ver respuestas correctas
              </button>
              <ShareButton />
              <FeedbackButton />
            </div>
          </div>

          <Teleport to="body">
            <Transition name="modal">
              <div v-if="showUpload" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showUpload = false">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                  <button @click="showUpload = false" class="absolute top-3 right-3 bg-neutral-100 rounded-full p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <ScribbleUpload :user-id="savedUserId" @back="showUpload = false" />
                </div>
              </div>
            </Transition>
          </Teleport>

          <Transition name="fade">
            <div v-if="showResults" class="mt-6 text-left">
              <div class="space-y-3">
                <div v-for="r in resultsData" :key="r.num" class="card">
                  <p class="text-neutral-700 mb-3">
                    <span class="text-neutral-400 font-mono mr-1">{{ r.num }}.</span>
                    {{ r.texto }}
                  </p>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="rounded-xl px-3 py-2 text-center" :class="logErrBg(r)">
                      <p class="text-xs mb-0.5" :class="logErrLabel(r)">Tu respuesta</p>
                      <p class="font-mono font-medium" :class="logErrValueClass(r)">
                        {{ r.answer != null ? formatNumber(r.answer) : '—' }}<span v-if="r.inRange"> ⭐</span>
                      </p>
                    </div>
                    <div class="bg-neutral-50 rounded-xl px-3 py-2 text-center">
                      <p class="text-xs text-neutral-400 mb-0.5">Respuesta correcta</p>
                      <p class="font-medium text-neutral-800">
                        <template v-if="r.hasP">{{ formatRange(r.p05, r.p95) }}</template>
                        <template v-else>—</template>
                      </p>
                    </div>
                  </div>
                  <p v-if="r.logErr !== null" class="text-xs text-center mt-2" :class="logErrLabel(r)">
                    Error log: <span class="font-bold">{{ r.logErr.toFixed(2) }}</span>
                  </p>
                  <div v-if="r.population.length >= 2 && !isLoadingResponses" class="mt-3 border-t border-neutral-100 pt-3">
                    <ResponseHistogram :responses="r.population" :user-answer="r.answer" :correct-range="r.hasP ? { min: r.p05, max: r.p95 } : null" />
                  </div>
                  <p v-else-if="isLoadingResponses" class="text-xs text-neutral-400 text-center mt-2">Cargando datos de población...</p>
                </div>
              </div>
              <div v-if="avgLogErr" class="card text-center mt-3">
                <p class="text-sm text-neutral-500">Error logarítmico medio</p>
                <p class="text-3xl font-bold text-neutral-800">{{ avgLogErr }}</p>
              </div>
            </div>
          </Transition>

          <LogErrorModal :show="showLogErrorModal" @close="showLogErrorModal = false" />
          <ScoreExplanationModal :show="showScoreModal" @close="showScoreModal = false" />

        </div>
      </Transition>
    </div>
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

.timer-shaking .timer-icon {
  @apply scale-110;
}

@keyframes shake {
  0%, 100% { transform: translateX(0) scale(1.25); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px) scale(1.25); }
  20%, 40%, 60%, 80% { transform: translateX(2px) scale(1.25); }
}

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
