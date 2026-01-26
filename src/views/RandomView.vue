<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { preguntasPorModelo } from '@/data/preguntas'

// Obtener todas las preguntas de todos los modelos
const allPreguntas = Object.values(preguntasPorModelo).flat()

// Estado
const currentQuestion = ref(null)
const currentAnswer = ref('')
const showResult = ref(false)

// Formateador de números
const { formatNumber, cleanInput } = useNumberFormat()

// Número formateado para mostrar
const formattedAnswer = computed(() => {
  const cleaned = cleanInput(currentAnswer.value)
  if (!cleaned) return ''
  return formatNumber(parseInt(cleaned, 10))
})

// Valor de referencia formateado
const formattedReference = computed(() => {
  if (!currentQuestion.value?.valorReferencia) return ''
  return formatNumber(currentQuestion.value.valorReferencia)
})

// Obtener pregunta aleatoria
function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * allPreguntas.length)
  currentQuestion.value = allPreguntas[randomIndex]
  currentAnswer.value = ''
  showResult.value = false
}

// Inicializar con una pregunta
getRandomQuestion()

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

        <!-- Texto de la pregunta -->
        <div class="mb-8">
          <h2 class="text-xl font-medium text-neutral-800 leading-relaxed">
            {{ currentQuestion?.texto }}
          </h2>
          <p v-if="currentQuestion?.unidad" class="text-sm text-neutral-400 mt-2">
            Responde en: {{ currentQuestion.unidad }}
          </p>
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
          <div class="grid grid-cols-2 gap-4">
            <!-- Tu respuesta -->
            <div class="bg-neutral-50 rounded-2xl p-4 text-center">
              <p class="text-sm text-neutral-500 mb-2">Tu estimación</p>
              <p class="text-2xl font-bold text-neutral-800">
                {{ formattedAnswer }}
              </p>
            </div>

            <!-- Valor de referencia -->
            <div class="bg-primary-50 rounded-2xl p-4 text-center">
              <p class="text-sm text-primary-600 mb-2">Valor de referencia</p>
              <p class="text-2xl font-bold text-primary-700">
                {{ formattedReference }}
              </p>
            </div>
          </div>

          <p class="text-xs text-neutral-400 text-center italic">
            Los valores de referencia son aproximados y pueden variar según la fuente.
          </p>

          <!-- Botón nueva pregunta -->
          <button
            @click="getRandomQuestion"
            class="btn-primary btn-large w-full"
          >
            Otra pregunta
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="text-center mt-6 text-sm text-neutral-400">
        <p>Esta modalidad no guarda datos. Es solo para practicar.</p>
      </div>
    </div>
  </div>
</template>
