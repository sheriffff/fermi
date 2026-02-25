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

const { formatNumber, cleanInput } = useNumberFormat()
const { start: startTimer, stop: stopTimer, reset: resetTimer, getElapsedTime } = useTimer(9999)

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
  <div class="min-h-screen p-8">
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
  </div>
</template>
