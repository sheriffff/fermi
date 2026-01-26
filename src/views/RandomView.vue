<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { getRandomQuestion as fetchRandomQuestion } from '@/lib/questions'
import FermiInput from '@/components/common/FermiInput.vue'

const currentQuestion = ref(null)
const currentAnswer = ref('')
const showResult = ref(false)
const isLoading = ref(true)
const fermiInputRef = ref(null)

const { formatNumber, cleanInput } = useNumberFormat()

const formattedAnswer = computed(() => {
  const cleaned = cleanInput(currentAnswer.value)
  if (!cleaned) return '—'
  return formatNumber(parseInt(cleaned, 10))
})

const isAnswerComplete = computed(() => {
  return cleanInput(currentAnswer.value) !== ''
})

async function getNewQuestion() {
  isLoading.value = true
  currentQuestion.value = await fetchRandomQuestion()
  currentAnswer.value = ''
  showResult.value = false
  isLoading.value = false
}

onMounted(() => {
  getNewQuestion()
})

function handleSubmit() {
  if (isAnswerComplete.value) {
    showResult.value = true
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-2xl w-full">

      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-block mb-4 text-primary-500 hover:text-primary-600 transition-colors">
          ← Volver al inicio
        </RouterLink>
        <h1 class="text-3xl font-bold text-neutral-800">
          Estima:
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
          />

          <button
            @click="handleSubmit"
            class="btn-primary btn-large w-full"
            :disabled="!isAnswerComplete"
          >
            Ver resultado
          </button>
        </div>

        <div v-else class="space-y-6">
          <div class="bg-neutral-50 rounded-2xl p-6 text-center">
            <p class="text-sm text-neutral-500 mb-2">Tu estimación</p>
            <p class="text-3xl font-bold text-neutral-800">
              {{ formattedAnswer }}
            </p>
          </div>

          <p class="text-sm text-neutral-500 text-center">
            Respuesta registrada. ¿Quieres probar otra?
          </p>

          <button
            @click="getNewQuestion"
            class="btn-primary btn-large w-full"
          >
            Otra pregunta
          </button>
        </div>
        </template>
      </div>

      <div class="text-center mt-6 text-sm text-neutral-400">
        <p>Esta modalidad no guarda datos. Es solo para practicar.</p>
      </div>
    </div>
  </div>
</template>
