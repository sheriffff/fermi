<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useTimer } from '@/composables/useTimer'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { guardarRespuestasOnline } from '@/lib/supabase'
import { getTestQuestions, getAvailableTests } from '@/lib/questions'
import FermiInput from '@/components/common/FermiInput.vue'

// ============================================
// CONFIGURACIÓN DE TIEMPOS
// ============================================
const QUESTION_TIME = 10 // Segundos por pregunta (3 minutos)
const WARNING_TIME = 5   // Segundos antes del final para avisar

// ============================================
// ESTADO DEL FLUJO
// ============================================
const currentStep = ref('metadata') // 'metadata' | 'instructions' | 'test' | 'finished'
const isLoading = ref(false)
const error = ref(null)

// Aviso de 30 segundos
const showTimeWarning = ref(false)
const warningPlayed = ref(false)
const showTimer = ref(false)
const timerShaking = ref(false)

// ============================================
// METADATA DEL PARTICIPANTE
// ============================================
const metadata = ref({
  edad: '40',
  sexo: '',
  codigoPersonal: '',
  piVsE: '',
  segundaVez: false,
  modelosYaHechos: [] // Array de modelos que ya hizo
})

// Generar opciones de edad desde 4 hasta 99
const edadOptions = Array.from({ length: 96 }, (_, i) => i + 4)

const sexoOptions = [
  { value: 'chico', label: 'Chico' },
  { value: 'chica', label: 'Chica' },
  { value: 'otro', label: 'Otro' }
]

const piVsEOptions = [
  { value: 'pi', label: 'π (pi)' },
  { value: 'e', label: 'e (Euler)' },
  { value: 'no_se', label: 'No lo sé' }
]

const modeloOptions = ref(['A', 'B', 'C', 'D'])
const primerasPreguntasPorModelo = ref({})

// Cargar las primeras preguntas de cada modelo al montar
onMounted(async () => {
  const tests = await getAvailableTests()
  modeloOptions.value = tests

  // Cargar primera pregunta de cada test para reconocimiento
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

// Mostrar sexo solo si edad < 19
const mostrarSexo = computed(() => {
  return metadata.value.edad && parseInt(metadata.value.edad) < 19
})

const isMetadataValid = computed(() => {
  const m = metadata.value
  // Edad y pi/e son obligatorios
  const basicValid = m.edad && m.piVsE
  // Si es segunda vez, debe haber marcado al menos un modelo ya hecho
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

function toggleTimer() {
  showTimer.value = !showTimer.value
}

// ============================================
// FORMATEADOR DE NÚMEROS
// ============================================
const { formatNumber, cleanInput } = useNumberFormat()

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
  showTimer.value = false
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
    await guardarRespuestasOnline({
      edad: parseInt(metadata.value.edad),
      sexo: metadata.value.sexo,
      piVsE: metadata.value.piVsE,
      segundaVez: metadata.value.segundaVez,
      modelo: modeloAsignado.value,
      respuestas: respuestas.value,
      tiempos: tiempos.value
    })
  } catch (e) {
    console.error('Error guardando respuestas:', e)
    // Continuar de todos modos para mostrar pantalla final
  } finally {
    isLoading.value = false
    currentStep.value = 'finished'
  }
}
</script>

<template>
  <div class="min-h-screen p-8">
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
            <p class="text-neutral-600 mt-2">
              Un test de 8 preguntas sobre estimación de cantidades
            </p>
          </div>

          <!-- Aviso de sinceridad -->
          <div class="card bg-secondary-50 border-secondary-200 mb-6">
            <div class="flex gap-3">
              <span class="text-2xl">💡</span>
              <div>
                <p class="font-medium text-secondary-700 mb-1">
                  Esto NO es un examen de conocimientos. Y es anónimo!
                </p>
                <p class="text-sm text-secondary-600">
                  Quiero ver cómo funciona el cerebro. Cómo estimamos cantidades.
                  Coge un papel y un boli para hacer algún cálculo. No busques información. A pelo.
                </p>
              </div>
            </div>
          </div>

          <!-- Formulario -->
          <div class="card">
            <form @submit.prevent="startTest" class="space-y-6">

              <!-- Edad y Sexo en 2 columnas -->
              <div class="grid grid-cols-2 gap-4">
                <!-- Columna 1: Edad -->
                <div>
                  <label class="label">Edad</label>
                  <select v-model="metadata.edad" class="select" required>
                    <option value="" disabled>Selecciona tu edad</option>
                    <option
                      v-for="edad in edadOptions"
                      :key="edad"
                      :value="edad"
                    >
                      {{ edad }}
                    </option>
                  </select>
                </div>

                <!-- Columna 2: Sexo (solo si edad < 19) -->
                <div>
                  <Transition name="fade">
                    <div v-if="mostrarSexo">
                      <label class="label">Sexo (opcional)</label>
                      <select v-model="metadata.sexo" class="select">
                        <option value="">Selecciona</option>
                        <option
                          v-for="option in sexoOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                      <p class="text-xs text-neutral-500 mt-1 italic">
                        ¿Se notará que chicos y chicas adolescentes maduráis de media en diferentes momentos?
                      </p>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Pi vs E - ancho completo -->
              <div>
                <label class="label">¿Qué número es más grande?</label>
                <p class="text-xs text-neutral-400 mb-3 italic">
                  Esta pregunta me ayuda a calibrar tu familiaridad con las matemáticas. No es perfecta, pero da igual.
                </p>
                <div class="flex gap-4">
                  <label
                    v-for="option in piVsEOptions"
                    :key="option.value"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      v-model="metadata.piVsE"
                      :value="option.value"
                      class="w-4 h-4 text-primary-500"
                      required
                    />
                    <span class="text-neutral-700">{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <!-- ID - selector 1/3, texto ancho completo -->
              <div>
                <div class="w-1/3">
                  <label class="label">Alias (opcional)</label>
                  <input
                    v-model="metadata.codigoPersonal"
                    type="text"
                    class="input"
                    placeholder="Ej: Einstein42"
                    maxlength="20"
                  />
                </div>
                <p class="text-xs text-neutral-400 mt-2 italic">
                  Opcional. No hace falta para el estudio. Si lo rellenas, acuérdate, sácale una foto.
                  Te servirá a tí si quieres encontrarte luego en las listas de resultados y compararte con diferentes segmentos de la población.
                  No te pido el nombre porque quiero que sea anónimo. No me hagas inyección SQL, porfa.
                </p>
              </div>

              <!-- Segunda vez -->
              <div class="border-t border-neutral-100 pt-4">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="metadata.segundaVez"
                    class="w-5 h-5 rounded text-primary-500"
                  />
                  <span class="text-neutral-700">
                    Ya hice el test antes
                  </span>
                </label>
                <p class="text-xs text-neutral-400 mt-1 ml-8 italic">
                  Hay 4 modelos. Puedes jugar más veces. No repitas.
                </p>

                <!-- Selector de modelos ya hechos -->
                <Transition name="fade">
                  <div v-if="metadata.segundaVez" class="mt-4 pl-8 space-y-3">
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
                <span v-if="isLoading">Cargando preguntas...</span>
                <span v-else>Comenzar Test →</span>
              </button>
            </form>
          </div>
        </div>

        <div v-else-if="currentStep === 'instructions'" key="instructions">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-neutral-800">
              Antes de empezar... 📋
            </h1>
          </div>

          <div class="card-elevated space-y-6">
            <div class="space-y-4">
              <div class="flex gap-4 items-start">
                <span class="text-2xl">⏱️</span>
                <div>
                  <p class="font-semibold text-neutral-800">Tienes 3 minutos por pregunta</p>
                  <p class="text-sm text-neutral-500">
                    Puedes pulsar el <span class="text-lg">⏱️</span> de arriba para ver/ocultar el tiempo.
                    Te avisaré con un sonido cuando queden 30 segundos.
                    Si no contestas a tiempo, pasarás automáticamente a la siguiente pregunta.
                  </p>
                </div>
              </div>

              <div class="flex gap-4 items-start">
                <span class="text-2xl">🔢</span>
                <div>
                  <p class="font-semibold text-neutral-800">Escribe números grandes fácilmente</p>
                  <p class="text-sm text-neutral-500">
                    Usa el botón <span class="font-mono bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">×1000</span> para multiplicar rápidamente.
                    Hay otro botón <span class="font-mono bg-secondary-100 text-secondary-600 px-1.5 py-0.5 rounded">÷1000</span> para dividir rápidamente.
                  </p>
                </div>
              </div>

              <div class="flex gap-4 items-start">
                <span class="text-2xl">📝</span>
                <div>
                  <p class="font-semibold text-neutral-800">Usa papel y boli</p>
                  <p class="text-sm text-neutral-500">
                    Tenlos a mano antes de empezar. Te harán falta para hacer algunas operaciones.
                  </p>
                </div>
              </div>

              <div class="flex gap-4 items-start">
                <span class="text-2xl">🎯</span>
                <div>
                  <p class="font-semibold text-neutral-800">Esto no es un exámen.</p>
                  <p class="text-sm text-neutral-500">
                    Disfruta!
                  </p>
                </div>
              </div>
            </div>

            <button
              @click="startQuestions"
              class="btn-primary btn-large w-full"
            >
              ¡Entendido, empezamos! 🚀
            </button>
          </div>
        </div>

        <div v-else-if="currentStep === 'test'" key="test" class="space-y-6">

          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-neutral-500 font-medium">
              Pregunta {{ questionNumber }} de {{ totalQuestions }}
            </span>
            <div class="flex items-center gap-3">
              <button
                @click="toggleTimer"
                class="timer-toggle"
                :class="{ 'timer-shaking': timerShaking }"
              >
                <span class="timer-icon">⏱️</span>
                <Transition name="fade">
                  <span v-if="showTimer || showTimeWarning" class="timer-value">
                    {{ formattedTime }}
                  </span>
                </Transition>
              </button>
              <span class="font-mono text-sm text-neutral-400">
                Modelo {{ modeloAsignado }}
              </span>
            </div>
          </div>

          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>


          <Transition name="slide" mode="out-in">
            <div :key="currentQuestionIndex" class="card-elevated">

              <div class="mb-8">
                <h2 class="text-xl font-medium text-neutral-800 leading-relaxed">
                  {{ currentQuestion?.texto }}
                </h2>
                <p v-if="currentQuestion?.unidad" class="text-sm text-neutral-400 mt-2">
                  Responde en: {{ currentQuestion.unidad }}
                </p>
              </div>

              <FermiInput v-model="currentAnswer" />

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

            <p class="text-neutral-600 mb-8 max-w-md mx-auto">
              Tus respuestas han sido guardadas correctamente.
              Tu contribución es muy valiosa para esta investigación.
            </p>

            <div class="bg-neutral-50 rounded-2xl p-6 mb-8 max-w-sm mx-auto">
              <p class="text-sm text-neutral-500 mb-2">Modelo completado</p>
              <p class="font-mono text-2xl font-bold text-primary-500">
                {{ modeloAsignado }}
              </p>
            </div>

            <RouterLink to="/" class="btn-primary btn-large">
              Volver al inicio
            </RouterLink>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/main.css";

.timer-toggle {
  @apply flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer;
  @apply bg-neutral-100 hover:bg-neutral-200 transition-all duration-200;
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

