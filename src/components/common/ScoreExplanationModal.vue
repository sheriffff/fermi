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

          <h2 class="text-2xl font-bold text-neutral-800 mb-4">¿Cómo se calcula la nota? 🧮</h2>

          <div class="space-y-4 text-neutral-600 leading-relaxed">
            <p>
              La nota no es fija. <strong>Depende de cuánto lo hacen los demás.</strong>
            </p>

            <div class="bg-neutral-50 rounded-xl p-4 space-y-2">
              <p class="font-semibold text-neutral-700">¿Qué es un percentil?</p>
              <!-- Los que sois padres lo sabéis muy bien: es lo mismo que en las gráficas del pediatra -->
              <p>
                Si estás en el <strong>percentil 80</strong>, significa que lo hiciste mejor que el 80% de la gente que ha jugado. Cuanto más alto, mejor.
              </p>
              <p class="text-sm text-neutral-400 italic">
                (Los que sois madres o padres lo sabéis de sobra: es exactamente lo mismo que usan en las revisiones del pediatra para el peso y la talla.)
              </p>
            </div>

            <p>
              Para cada pregunta, comparo tu error logarítmico con el de todos los que ya han jugado. Calculo en qué percentil quedas. La nota final es la <strong>media de tus percentiles en todas las preguntas, sobre 10</strong>.
            </p>

            <div class="bg-primary-50 rounded-xl p-4 border border-primary-100">
              <p class="font-semibold text-primary-700 mb-1">Esta nota puede cambiar</p>
              <p class="text-sm text-primary-600">
                Como depende de quién ha jugado hasta ahora, tu nota de hoy puede ser diferente a la de mañana, cuando haya más gente en la base de datos. Es una nota viva, no estática.
              </p>
            </div>

            <p class="text-sm text-neutral-400">
              Si no hay suficientes datos de población para una pregunta, esa pregunta no cuenta para la nota.
            </p>
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
