<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { getRandomQuestion as fetchRandomQuestion } from '@/lib/questions'

// Estado
const currentQuestion = ref(null)
const currentAnswer = ref('')
const showResult = ref(false)
const isLoading = ref(true)

// Formateador de números
const { formatNumber, cleanInput } = useNumberFormat()

// Número formateado para mostrar
const formattedAnswer = computed(() => {
  const cleaned = cleanInput(currentAnswer.value)
  if (!cleaned) return ''
  return formatNumber(parseInt(cleaned, 10))
})

// Obtener pregunta aleatoria
async function getNewQuestion() {
  isLoading.value = true
  currentQuestion.value = await fetchRandomQuestion()
  currentAnswer.value = ''
  showResult.value = false
  isLoading.value = false
}

// Inicializar con una pregunta
onMounted(() => {
  getNewQuestion()
})

// Manejar input: solo números
function handleInput(event) {
  const value = event.target.value
  currentAnswer.value = value.replace(/\D/g, '')
}

// Enviar respuesta
function handleSubmit() {
  if (currentAnswer.value) {
    showResult.value = true
  }
}

// Manejar Enter para enviar
function handleKeydown(event) {
  if (event.key === 'Enter' && currentAnswer.value && !showResult.value) {
    handleSubmit()
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-2xl w-full">

      <!-- Header -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-block mb-4 text-primary-500 hover:text-primary-600 transition-colors">
          ← Volver al inicio
        </RouterLink>
        <h1 class="text-3xl font-bold text-neutral-800">
          Pregunta Aleatoria
        </h1>
        <p class="text-neutral-600 mt-2">
          Practica tu capacidad de estimación sin presión
        </p>
      </div>

      <!-- Card de pregunta -->
      <div class="card-elevated">

        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-8">
          <p class="text-neutral-500">Cargando pregunta...</p>
        </div>

        <template v-else>
        <!-- Texto de la pregunta -->
        <div class="mb-8">
          <p class="text-xs text-neutral-400 mb-2">{{ currentQuestion?.category }}</p>
          <h2 class="text-xl font-medium text-neutral-800 leading-relaxed">
            {{ currentQuestion?.texto }}
          </h2>
        </div>

        <!-- Input numérico (solo si no se ha mostrado resultado) -->
        <div v-if="!showResult" class="space-y-4">
          <input
            :value="currentAnswer"
            @input="handleInput"
            @keydown="handleKeydown"
            type="text"
            inputmode="numeric"
            class="input-large"
            placeholder="Escribe tu estimación"
            autocomplete="off"
          />

          <!-- Feedback del número formateado -->
          <Transition name="fade">
            <div v-if="formattedAnswer" class="text-center">
              <span class="number-display">
                {{ formattedAnswer }}
              </span>
            </div>
          </Transition>

          <!-- Botón enviar -->
          <button
            @click="handleSubmit"
            class="btn-primary btn-large w-full"
            :disabled="!currentAnswer"
          >
            Ver resultado
          </button>
        </div>

        <!-- Resultado -->
        <div v-else class="space-y-6">
          <!-- Tu respuesta -->
          <div class="bg-neutral-50 rounded-2xl p-6 text-center">
            <p class="text-sm text-neutral-500 mb-2">Tu estimación</p>
            <p class="text-3xl font-bold text-neutral-800">
              {{ formattedAnswer }}
            </p>
          </div>

          <p class="text-sm text-neutral-500 text-center">
            Respuesta registrada. ¿Quieres probar otra?
          </p>

          <!-- Botón nueva pregunta -->
          <button
            @click="getNewQuestion"
            class="btn-primary btn-large w-full"
          >
            Otra pregunta
          </button>
        </div>
        </template>
      </div>

      <!-- Info -->
      <div class="text-center mt-6 text-sm text-neutral-400">
        <p>Esta modalidad no guarda datos. Es solo para practicar.</p>
      </div>
    </div>
  </div>
</template>
