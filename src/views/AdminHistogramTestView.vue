<script setup>
import { ref, computed } from 'vue'
import ResponseHistogram from '@/components/common/ResponseHistogram.vue'

const rangeMin = ref('')
const rangeMax = ref('')
const userAnswerInput = ref('')
const newResponseInput = ref('')
const responses = ref([])

const correctRange = computed(() => {
  const min = parseFloat(rangeMin.value)
  const max = parseFloat(rangeMax.value)
  if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) return { min, max }
  return null
})

const userAnswer = computed(() => {
  const n = parseFloat(userAnswerInput.value)
  return !isNaN(n) && n > 0 ? n : null
})

const EXPONENTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function addResponse(multiplier = 1) {
  const base = parseFloat(newResponseInput.value)
  if (!isNaN(base) && base > 0) {
    responses.value.push(base * multiplier)
  }
}

function removeResponse(i) {
  responses.value.splice(i, 1)
}

function clearAll() {
  responses.value = []
}
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <h2 class="text-xl font-bold text-neutral-800">Test Histograma</h2>

    <div class="card space-y-5">
      <div>
        <p class="text-sm font-semibold text-neutral-700 mb-3">Rango correcto</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-neutral-500 mb-1 block">Mín (p05)</label>
            <input v-model="rangeMin" type="number" class="input" placeholder="ej. 10000" />
          </div>
          <div>
            <label class="text-xs text-neutral-500 mb-1 block">Máx (p95)</label>
            <input v-model="rangeMax" type="number" class="input" placeholder="ej. 1000000" />
          </div>
        </div>
      </div>

      <div>
        <label class="text-sm font-semibold text-neutral-700 mb-1 block">Mi respuesta <span class="font-normal text-neutral-400">(opcional)</span></label>
        <input v-model="userAnswerInput" type="number" class="input" placeholder="ej. 50000" />
      </div>

      <div>
        <label class="text-sm font-semibold text-neutral-700 mb-1 block">Añadir respuesta de jugador</label>
        <div class="flex gap-2 mb-2">
          <input
            v-model="newResponseInput"
            type="number"
            class="input flex-1"
            placeholder="base (ej. 3)"
            @keydown.enter="addResponse(1)"
          />
          <button @click="addResponse(1)" class="btn-primary px-5">×1</button>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="exp in EXPONENTS"
            :key="exp"
            @click="addResponse(Math.pow(10, exp))"
            class="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-primary-100 hover:text-primary-700 text-neutral-600 transition-colors font-mono"
          >
            ×10<sup>{{ exp }}</sup>
          </button>
        </div>
      </div>

      <div v-if="responses.length" class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs text-neutral-500">{{ responses.length }} respuesta{{ responses.length !== 1 ? 's' : '' }}</p>
          <button @click="clearAll" class="text-xs text-red-400 hover:text-red-600">Limpiar todo</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(r, i) in responses"
            :key="i"
            class="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-sm px-3 py-1 rounded-full"
          >
            {{ r.toLocaleString('es-ES') }}
            <button @click="removeResponse(i)" class="text-neutral-400 hover:text-neutral-700 leading-none">×</button>
          </span>
        </div>
      </div>
    </div>

    <div v-if="responses.length || correctRange" class="card">
      <ResponseHistogram
        :key="responses.length"
        :responses="responses"
        :user-answer="userAnswer"
        :correct-range="correctRange"
      />
    </div>
  </div>
</template>
