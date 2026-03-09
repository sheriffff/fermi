<script setup>
defineProps({
  show: { type: Boolean, required: true }
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <button
            @click="emit('close')"
            class="absolute top-3 right-3 bg-neutral-100 rounded-full p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="text-2xl font-bold text-neutral-800 mb-6">¿Cómo se calcula tu puntuación? 🧮</h2>

          <div class="space-y-5 text-neutral-600 leading-relaxed">

            <div>
              <p class="text-base font-semibold text-neutral-800 mb-1">1. ¿Qué es un percentil?</p>
              <p class="text-sm text-neutral-500 italic mb-2">Esto no lo saben más que los estadísticos y los que son padres y han ido al pediatra.</p>
              <p>Mejor con un ejemplo: si estás en el percentil 80 del peso de una población,
                significa que pesas más que el 80% de la población.</p>
            </div>

            <div>
              <p class="text-base font-semibold text-neutral-800 mb-1">2. Tu puntuación por pregunta</p>
              <p>Si la clavas, un <strong>10</strong>. Si no, pero lo haces mejor que el 70% de los jugadores
                (estás en el percentil 70), tienes un <strong>7</strong> en esa pregunta. </p>
            </div>

            <div>
              <p class="text-base font-semibold text-neutral-800 mb-1">3. Tu puntuación final</p>
              <p>La media de tus puntuaciones en las 8 preguntas.</p>
            </div>

            <div class="bg-primary-50 rounded-xl p-4 border border-primary-100">
              <p class="font-semibold text-primary-700 mb-1">Esta puntuación es orientativa</p>
              <p class="text-sm text-primary-600 mb-4">
                Depende de quién ha jugado hasta ahora, así que puede variar con el tiempo. Si juegas dentro de unos
                meses, cuando haya más datos, la puntuación podría ser algo diferente.
              </p>
              <p class="text-sm text-primary-600">
                Algo parecido a la campana de Gauss, para los que estudiásteis en los 70-80.
                Por que yo solo se lo oí a mi madre.
              </p>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
