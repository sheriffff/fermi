<script setup>
import { computed } from 'vue'

const props = defineProps({
  questionTime: {
    type: Number,
    required: true
  },
  warningTime: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['start'])

// Formato de tiempo para mostrar
const questionTimeText = computed(() => {
  const mins = Math.floor(props.questionTime / 60)
  const secs = props.questionTime % 60

  const minText = mins === 1 ? 'minuto' : 'minutos'
  const secText = secs === 1 ? 'segundo' : 'segundos'

  if (mins > 0 && secs > 0) {
    return `${mins} ${minText} y ${secs} ${secText}`
  } else if (mins > 0) {
    return `${mins} ${minText}`
  } else {
    return `${secs} ${secText}`
  }
})

// Formato del tiempo de aviso
const warningTimeText = computed(() => {
  const mins = Math.floor(props.warningTime / 60)
  const secs = props.warningTime % 60

  const minText = mins === 1 ? 'minuto' : 'minutos'
  const secText = secs === 1 ? 'segundo' : 'segundos'

  if (mins > 0 && secs > 0) {
    return `${mins} ${minText} y ${secs} ${secText}`
  } else if (mins > 0) {
    return `${mins} ${minText}`
  } else {
    return `${secs} ${secText}`
  }
})
</script>

<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-neutral-800">
        Antes de empezar... 📋
      </h1>
    </div>

    <div class="card-elevated space-y-6">
      <div class="space-y-4">
        <div class="flex gap-4 items-start">
          <span class="text-2xl">⚡</span>
          <div>
            <p class="font-semibold text-neutral-800">¿Tienes 10 minutitos?</p>
            <p class="text-sm text-neutral-500">
              Si ahora no los tienes, mejor vuelve otro día.
            </p>
          </div>
        </div>

        <div class="flex gap-4 items-start">
          <span class="text-2xl">⏱️</span>
          <div>
            <p class="font-semibold text-neutral-800">Son 8 preguntas, máximo {{ questionTimeText }} cada una</p>
            <p class="text-sm text-neutral-500">
              Pulsa el <span class="text-lg">⏱️</span> de arriba para ver el tiempo.
              Te avisaré con un sonido cuando queden {{ warningTimeText }}.
            </p>
          </div>
        </div>

        <div class="flex gap-4 items-start">
          <span class="text-2xl">🔢</span>
          <div>
            <p class="font-semibold text-neutral-800">Números grandes</p>
            <p class="text-sm text-neutral-500">
              Usa, si quieres, los botones <span class="font-mono bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">×1000</span> y <span class="font-mono bg-secondary-100 text-secondary-600 px-1.5 py-0.5 rounded">/1000</span>.
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
            <p class="font-semibold text-neutral-800">Esto no es un examen.</p>
            <p class="text-sm text-neutral-500">
              Y es anónimo. No busques información. Disfruta!
            </p>
          </div>
        </div>
      </div>

      <button
        @click="emit('start')"
        class="btn-primary btn-large w-full"
      >
        ¡Entendido, empezamos! 🚀
      </button>
    </div>
  </div>
</template>
