<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTestResults } from '@/composables/useTestResults'
import { useNumberFormat } from '@/composables/useNumberFormat'
import ResponseHistogram from '@/components/common/ResponseHistogram.vue'
import LogErrorModal from '@/components/common/LogErrorModal.vue'
import ScoreExplanationModal from '@/components/common/ScoreExplanationModal.vue'
import ScribbleUpload from '@/components/adultos/ScribbleUpload.vue'
import ShareButton from '@/components/common/ShareButton.vue'
import FeedbackButton from '@/components/common/FeedbackButton.vue'

const props = defineProps({
  preguntas: { type: Array, required: true },
  respuestas: { type: Object, required: true },
  modeloAsignado: { type: String, required: true },
  savedUserId: { type: String, default: null }
})

const { formatNumber, formatRange } = useNumberFormat()

const preguntasRef = computed(() => props.preguntas)
const respuestasRef = computed(() => props.respuestas)

const { resultsData, finalScore, isLoadingResponses, fetchAllResponses, logErrBg, logErrLabel, logErrValueClass } = useTestResults(preguntasRef, respuestasRef)

onMounted(() => fetchAllResponses(props.modeloAsignado))

const showResults = ref(false)
const showUpload = ref(false)
const showLogErrorModal = ref(false)
const showScoreModal = ref(false)

const expandedDetails = ref({})
function toggleDetail(num) {
  expandedDetails.value[num] = !expandedDetails.value[num]
}
</script>

<template>
  <div class="text-center">

    <div class="card-elevated py-12">
      <div class="text-6xl mb-6">🎉</div>
      <h1 class="text-3xl font-bold text-neutral-800 mb-4">¡Gracias por participar!</h1>

      <div v-if="finalScore || isLoadingResponses" class="mt-4 mb-6">
        <p v-if="finalScore" class="text-6xl font-bold text-primary-600">
          <span class="text-2xl font-semibold text-primary-600 mr-1">Tu puntuación:</span>{{ finalScore }}<span class="text-3xl font-semibold text-primary-600 ml-1">/10</span>
        </p>
        <p v-else class="text-sm text-neutral-400">Calculando tu nota...</p>
        <button @click="showScoreModal = true" class="mt-1 text-sm text-primary-500 hover:text-primary-700 underline underline-offset-2 transition-colors">
          ¿Cómo se calcula tu puntuación?
        </button>
      </div>

      <div class="flex flex-col items-center gap-3">
        <button v-if="savedUserId" @click="showUpload = true" class="btn-outline btn-large w-full max-w-xs">
          📸 Sube una foto de tu hoja en sucio!
        </button>
        <button v-if="!showResults" @click="showResults = true" class="btn-outline btn-large w-full max-w-xs">
          📝 Ver tu puntuación por pregunta
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
            <div class="grid grid-cols-3 gap-2">
              <div class="rounded-xl px-3 py-2 text-center" :class="logErrBg(r)">
                <p class="text-xs mb-0.5" :class="logErrLabel(r)">Tu respuesta</p>
                <p class="font-mono font-medium text-sm" :class="logErrValueClass(r)">
                  {{ r.answer != null ? formatNumber(r.answer) : '—' }}<span v-if="r.inRange"> ⭐</span>
                </p>
              </div>
              <div class="bg-neutral-50 rounded-xl px-3 py-2 text-center">
                <p class="text-xs text-neutral-400 mb-0.5">Respuesta correcta</p>
                <p class="font-medium text-neutral-800 text-sm">
                  <template v-if="r.hasP">{{ formatRange(r.p05, r.p95) }}</template>
                  <template v-else>—</template>
                </p>
              </div>
              <div class="rounded-xl px-3 py-2 text-center" :class="logErrBg(r)">
                <p class="text-xs mb-0.5" :class="logErrLabel(r)">Nota</p>
                <p class="font-bold text-sm" :class="logErrValueClass(r)">
                  {{ r.percentile !== null ? (r.percentile === 1 ? '10' : (r.percentile * 10).toFixed(1)) : '—' }}
                </p>
              </div>
            </div>
            <button
              v-if="r.population.length >= 2 || r.logErr !== null"
              @click="toggleDetail(r.num)"
              class="mt-2 text-xs text-primary-500 hover:text-primary-700 transition-colors w-full text-right"
            >
              {{ expandedDetails[r.num] ? 'Ocultar detalle ↑' : 'Ver detalle ↓' }}
            </button>
            <div v-if="expandedDetails[r.num]" class="mt-3 border-t border-neutral-100 pt-3">
              <div v-if="r.population.length >= 2 && !isLoadingResponses">
                <ResponseHistogram :responses="r.population" :user-answer="r.answer" :correct-range="r.hasP ? { min: r.p05, max: r.p95 } : null" />
              </div>
              <p v-else-if="isLoadingResponses" class="text-xs text-neutral-400 text-center">Cargando datos de población...</p>
            </div>
          </div>
        </div>
        <div v-if="savedUserId" class="flex justify-center mt-4">
        <button @click="showUpload = true" class="btn-outline w-full max-w-xs">
          📸 Sube una foto de tu hoja en sucio!
        </button>
        </div>
      </div>
    </Transition>

    <LogErrorModal :show="showLogErrorModal" @close="showLogErrorModal = false" />
    <ScoreExplanationModal :show="showScoreModal" @close="showScoreModal = false" />

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
