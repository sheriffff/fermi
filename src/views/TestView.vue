<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import QRCode from 'qrcode'
import { useTimer } from '@/composables/useTimer'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { createUserOnline, saveResponsesOnline } from '@/lib/supabase'
import { getTestQuestions, getAvailableTests } from '@/lib/questions'
import FermiInput from '@/components/common/FermiInput.vue'
import InstructionsCard from '@/components/common/InstructionsCard.vue'

// ============================================
// CONFIGURACIÓN DE TIEMPOS
// ============================================
const QUESTION_TIME = 120 // Segundos por pregunta (2 minutos)
const WARNING_TIME = 30  // Segundos antes del final para avisar

// ============================================
// ESTADO DEL FLUJO
// ============================================
const currentStep = ref('metadata') // 'metadata' | 'instructions' | 'test' | 'finished'
const isLoading = ref(false)
const error = ref(null)
const savedUserId = ref(null)
const qrDataUrl = ref(null)
const canShare = !!navigator.share

async function shareLink() {
  try {
    await navigator.share({
      title: '¡Juguemos a Estimar!',
      text: 'Acabo de hacer un test de estimación de cantidades. ¿Te atreves?',
      url: window.location.origin
    })
  } catch (e) {
    // user cancelled share
  }
}

// Aviso de 30 segundos
const showTimeWarning = ref(false)
const warningPlayed = ref(false)
const timerShaking = ref(false)

// ============================================
// METADATA DEL PARTICIPANTE
// ============================================
const metadata = ref({
  edad: '40',
  codigoPersonal: '',
  piVsE: '',
  segundaVez: false,
  modelosYaHechos: []
})

// Generar opciones de edad desde 4 hasta 99
const edadOptions = Array.from({ length: 96 }, (_, i) => i + 4)

const piVsEOptions = [
  { value: 'pi', label: 'π (pi)' },
  { value: 'e', label: 'e (Euler)' },
  { value: 'no_se', label: 'No lo sé / No lo recuerdo' }
]

const modeloOptions = ref(['A', 'B', 'C', 'D'])
const primerasPreguntasPorModelo = ref({})

// Cargar las primeras preguntas de cada modelo al montar
onMounted(async () => {
  const tests = await getAvailableTests()
  modeloOptions.value = tests

  for (const testNum of tests) {
    const questions = await getTestQuestions(testNum)
    if (questions.length > 0) {
      primerasPreguntasPorModelo.value[testNum] = questions[0].texto
    }
  }
})

// Toggle para marcar/desmarcar modelos ya hechos
function toggleModeloYaHecho(modelo) {
  const index = metadata.value.modelosYaHechos.indexOf(modelo)
  if (index > -1) {
    // Ya está marcado, quitarlo
    metadata.value.modelosYaHechos.splice(index, 1)
  } else {
    // No está marcado, añadirlo
    metadata.value.modelosYaHechos.push(modelo)
  }
}


const isMetadataValid = computed(() => {
  const m = metadata.value
  const basicValid = m.edad && m.piVsE
  if (m.segundaVez) {
    return basicValid && m.modelosYaHechos.length > 0
  }
  return basicValid
})

// ============================================
// ESTADO DEL TEST
// ============================================
const preguntas = ref([])
const currentQuestionIndex = ref(0)
const respuestas = ref({})
const tiempos = ref({})
const modeloAsignado = ref('')

// Pregunta actual
const currentQuestion = computed(() => {
  return preguntas.value[currentQuestionIndex.value] || null
})

// Número de pregunta actual (1-based para mostrar)
const questionNumber = computed(() => currentQuestionIndex.value + 1)

// Total de preguntas
const totalQuestions = computed(() => preguntas.value.length)

// Progreso en porcentaje
const progressPercent = computed(() => {
  if (totalQuestions.value === 0) return 0
  return (currentQuestionIndex.value / totalQuestions.value) * 100
})

// Respuesta actual del input
const currentAnswer = ref('')
const fermiInputRef = ref(null)

function focusInput() {
  fermiInputRef.value?.inputRef?.focus()
}

const isAnswerComplete = computed(() => {
  return cleanInput(currentAnswer.value) !== ''
})

// ============================================
// TIMER
// ============================================
const {
  formattedTime,
  timerClass,
  timerState,
  percentageRemaining,
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
    playWarningSound()
    setTimeout(() => {
      timerShaking.value = false
    }, 1000)
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
// FORMATEADOR DE NÚMEROS
// ============================================
const { formatNumber, formatRange, cleanInput } = useNumberFormat()

const showResults = ref(false)

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
    return { num: i + 1, texto: q.texto, answer, p05: q.p05, p95: q.p95, hasP, logErr, inRange }
  })
})

const formattedAnswer = computed(() => {
  const cleaned = cleanInput(currentAnswer.value)
  if (!cleaned) return '—'
  return formatNumber(parseInt(cleaned, 10))
})

// ============================================
// HANDLERS
// ============================================

async function startTest() {
  if (!isMetadataValid.value) return

  isLoading.value = true
  error.value = null

  try {
    let modelo
    const availableTests = modeloOptions.value

    if (metadata.value.segundaVez && metadata.value.modelosYaHechos.length > 0) {
      const modelosDisponibles = availableTests.filter(
        m => !metadata.value.modelosYaHechos.includes(m)
      )
      if (modelosDisponibles.length > 0) {
        modelo = modelosDisponibles[Math.floor(Math.random() * modelosDisponibles.length)]
      } else {
        modelo = availableTests[Math.floor(Math.random() * availableTests.length)]
      }
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

    // Ir a instrucciones primero
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
  // Guardar respuesta actual (aunque esté vacía) y pasar a siguiente
  saveCurrentAnswer()
  goToNextQuestion()
}

function handleSubmitAnswer() {
  saveCurrentAnswer()
  goToNextQuestion()
}

function saveCurrentAnswer() {
  const questionKey = `p${currentQuestionIndex.value + 1}`
  const cleaned = cleanInput(currentAnswer.value)

  respuestas.value[questionKey] = cleaned ? parseInt(cleaned, 10) : null

  tiempos.value[questionKey] = getElapsedTime()
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
    const userId = await createUserOnline({
      age: parseInt(metadata.value.edad),
      piVsE: metadata.value.piVsE,
      whichTestsBefore: metadata.value.modelosYaHechos.join(''),
      userAlias: metadata.value.codigoPersonal,
      testModel: modeloAsignado.value
    })

    const rows = Object.keys(respuestas.value).map(key => {
      const n = parseInt(key.replace('p', ''), 10)
      return {
        questionN: n,
        response: respuestas.value[key],
        time: tiempos.value[key]
      }
    })

    await saveResponsesOnline(userId, modeloAsignado.value, rows)

    savedUserId.value = userId
  } catch (e) {
    console.error('Error guardando respuestas:', e)
  } finally {
    isLoading.value = false
    currentStep.value = 'finished'
  }

  // TODO: QR generation - UploadView ruta no está disponible en Vercel
  // if (savedUserId.value) {
  //   try {
  //     const uploadUrl = `${window.location.origin}/upload/${savedUserId.value}`
  //     qrDataUrl.value = await QRCode.toDataURL(uploadUrl, { width: 200, margin: 2 })
  //   } catch (e) {
  //     console.error('Error generando QR:', e)
  //   }
  // }
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
    <RouterLink to="/" class="inline-block mb-6 text-primary-500 hover:text-primary-600 transition-colors">
      ← Volver al inicio
    </RouterLink>

    <div class="max-w-2xl mx-auto">

      <Transition name="fade" mode="out-in">
        <div v-if="currentStep === 'metadata'" key="metadata">

          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-neutral-800">
              ¡Juguemos a Estimar! 🎯
            </h1>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="startTest" class="space-y-4">

            <div class="card space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="label">Edad</label>
                  <select v-model="metadata.edad" class="select" required>
                    <option value="" disabled>—</option>
                    <option
                      v-for="edad in edadOptions"
                      :key="edad"
                      :value="edad"
                    >
                      {{ edad }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="label">Alias <span class="font-normal text-neutral-400">(opcional)</span></label>
                  <input
                    v-model="metadata.codigoPersonal"
                    type="text"
                    class="input"
                    placeholder="Einstein42"
                    maxlength="20"
                  />
                  <p class="text-sm text-neutral-400 mt-1.5 italic">
                    Por si quieres encontrarte más tarde en la tabla de resultados.
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <label class="label !mb-0">¿Qué número es más grande?</label>
                <div class="flex flex-wrap gap-2">
                  <label
                    v-for="option in piVsEOptions"
                    :key="option.value"
                    class="flex-1 min-w-[100px] cursor-pointer"
                  >
                    <input
                      type="radio"
                      v-model="metadata.piVsE"
                      :value="option.value"
                      class="sr-only peer"
                      required
                    />
                    <div class="text-center py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 border-neutral-200 text-neutral-600 hover:border-neutral-300 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700">
                      {{ option.label }}
                    </div>
                  </label>
                </div>
                <p class="text-sm text-neutral-400 italic">
                  Esta pregunta me ayuda a calibrar tu familiaridad con las matemáticas. No es perfecta, pero da igual.
                </p>
              </div>
            </div>

            <!-- Segunda vez -->
            <div class="card space-y-3">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="metadata.segundaVez"
                  class="w-5 h-5 rounded text-primary-500"
                />
                <span class="text-neutral-700 font-medium">
                  Ya hice el test antes
                </span>
              </label>
              <p class="text-sm text-neutral-400 ml-8 italic">
                Hay 4 modelos. Puedes jugar más veces.
              </p>

              <Transition name="fade">
                <div v-if="metadata.segundaVez" class="ml-8 space-y-3 pt-1">
                  <label class="label">Marca cuáles hiciste ya:</label>
                  <div class="space-y-2">
                    <label
                      v-for="modelo in modeloOptions"
                      :key="modelo"
                      class="flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer hover:bg-neutral-50"
                      :class="[
                        metadata.modelosYaHechos.includes(modelo)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200'
                      ]"
                    >
                      <input
                        type="checkbox"
                        :checked="metadata.modelosYaHechos.includes(modelo)"
                        @change="toggleModeloYaHecho(modelo)"
                        class="w-5 h-5 rounded text-primary-500 mt-0.5"
                      />
                      <span class="flex-1">
                        <span class="font-mono font-bold text-neutral-800 block">Modelo {{ modelo }}</span>
                        <span class="text-xs text-neutral-500 mt-1 italic block">
                          La P1 decía: "{{ primerasPreguntasPorModelo[modelo] }}"
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </Transition>
            </div>

            <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
              {{ error }}
            </div>

            <button
              type="submit"
              class="btn-primary btn-large w-full"
              :disabled="!isMetadataValid || isLoading"
            >
              <span v-if="isLoading">Cargando...</span>
              <span v-else>Vamos →</span>
            </button>
          </form>
        </div>

        <div v-else-if="currentStep === 'instructions'" key="instructions">
          <InstructionsCard
            :question-time="QUESTION_TIME"
            :warning-time="WARNING_TIME"
            @start="startQuestions"
          />
        </div>

        <div v-else-if="currentStep === 'test'" key="test" class="space-y-6">

          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-neutral-500 font-medium">
              Pregunta {{ questionNumber }} de {{ totalQuestions }}
            </span>
            <span
              class="timer-toggle"
              :class="{ 'timer-shaking': timerShaking }"
            >
              <span class="timer-icon">⏱️</span>
              <span class="timer-value">{{ formattedTime }}</span>
            </span>
          </div>

          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>


          <Transition name="slide" mode="out-in" @after-enter="focusInput">
            <div :key="currentQuestionIndex" class="card-elevated">

              <div class="mb-8">
                <h2 class="text-xl font-medium text-neutral-800 leading-relaxed">
                  {{ currentQuestion?.texto }}
                </h2>
                <p v-if="currentQuestion?.unidad" class="text-sm text-neutral-400 mt-2">
                  Responde en: {{ currentQuestion.unidad }}
                </p>
              </div>

              <FermiInput ref="fermiInputRef" v-model="currentAnswer" @submit="isAnswerComplete && handleSubmitAnswer()" />

              <div class="mt-8">
                <button
                  @click="handleSubmitAnswer"
                  class="btn-primary btn-large w-full"
                  :disabled="!isAnswerComplete"
                >
                  <span v-if="questionNumber === totalQuestions">
                    Finalizar Test
                  </span>
                  <span v-else>
                    Siguiente Pregunta →
                  </span>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- ============================================ -->
        <!-- PANTALLA 3: FINALIZADO -->
        <!-- ============================================ -->
        <div v-else-if="currentStep === 'finished'" key="finished" class="text-center">

          <div class="card-elevated py-12">
            <div class="text-6xl mb-6">🎉</div>

            <h1 class="text-3xl font-bold text-neutral-800 mb-4">
              ¡Gracias por participar!
            </h1>

            <p class="text-neutral-600 mb-8">
              Tus respuestas me ayudan a entender mejor qué tal estimamos cantidades
            </p>

            <div class="flex flex-col items-center gap-3">
              <button
                v-if="!showResults"
                @click="showResults = true"
                class="btn-outline btn-large w-full max-w-xs"
              >
                Ver respuestas correctas
              </button>
              <button
                v-if="canShare"
                @click="shareLink"
                class="btn-primary btn-large w-full max-w-xs"
              >
                Compartir con un amigo 📤
              </button>
              <RouterLink to="/" class="btn-primary btn-large w-full max-w-xs">
                Volver al inicio
              </RouterLink>
            </div>
          </div>

          <Transition name="fade">
            <div v-if="showResults" class="mt-6 text-left">
              <div class="space-y-3">
                <div
                  v-for="r in resultsData"
                  :key="r.num"
                  class="card"
                >
                  <p class="text-neutral-700 mb-3">
                    <span class="text-neutral-400 font-mono mr-1">{{ r.num }}.</span>
                    {{ r.texto }}
                  </p>
                  <div class="grid grid-cols-2 gap-3">
                    <div
                      class="rounded-xl px-3 py-2 text-center"
                      :class="r.inRange ? 'bg-emerald-50' : 'bg-neutral-50'"
                    >
                      <p class="text-xs mb-0.5" :class="r.inRange ? 'text-emerald-500' : 'text-neutral-400'">Tu respuesta</p>
                      <p class="font-mono font-medium" :class="r.inRange ? 'text-emerald-800' : 'text-neutral-800'">
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
                </div>
              </div>
            </div>
          </Transition>

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

</style>

