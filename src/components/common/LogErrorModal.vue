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
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 transform">
          <button
            @click="emit('close')"
            class="absolute top-3 right-3 bg-neutral-100 rounded-full p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="text-2xl font-bold text-neutral-800 mb-4">Error logarítmico 📏</h2>

          <p class="text-neutral-600 leading-relaxed mb-2">
            Es el error en el <strong>número de cifras</strong>.
            Si tú dices 1.000 y el resultado es 100.000, tu error logarítmico es 2.
          </p>
          <p class="text-neutral-600 leading-relaxed mb-4">
            En los problemas de Fermi, lo que importa no es el resultado exacto, sino el <strong>orden de magnitud</strong> (el número de cifras). Por eso medimos el error en esta escala, la logarítmica.
          </p>

          <div class="bg-neutral-50 rounded-xl p-4 sm:p-5 mb-5">
            <svg viewBox="0 0 460 130" class="w-full" xmlns="http://www.w3.org/2000/svg">
              <line x1="30" y1="75" x2="430" y2="75" stroke="#a3a3a3" stroke-width="1.5"/>
              <line x1="30" y1="68" x2="30" y2="82" stroke="#525252" stroke-width="2"/>
              <text x="30" y="100" text-anchor="middle" font-size="12" fill="#525252">1</text>
              <text x="30" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10⁰</text>
              <line x1="110" y1="68" x2="110" y2="82" stroke="#525252" stroke-width="2"/>
              <text x="110" y="100" text-anchor="middle" font-size="12" fill="#525252">10</text>
              <text x="110" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10¹</text>
              <line x1="190" y1="68" x2="190" y2="82" stroke="#525252" stroke-width="2"/>
              <text x="190" y="100" text-anchor="middle" font-size="12" fill="#525252">100</text>
              <text x="190" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10²</text>
              <line x1="270" y1="68" x2="270" y2="82" stroke="#525252" stroke-width="2"/>
              <text x="270" y="100" text-anchor="middle" font-size="12" fill="#525252">1.000</text>
              <text x="270" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10³</text>
              <line x1="350" y1="68" x2="350" y2="82" stroke="#525252" stroke-width="2"/>
              <text x="350" y="100" text-anchor="middle" font-size="12" fill="#525252">10.000</text>
              <text x="350" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10⁴</text>
              <line x1="430" y1="68" x2="430" y2="82" stroke="#525252" stroke-width="2"/>
              <text x="430" y="100" text-anchor="middle" font-size="12" fill="#525252">100.000</text>
              <text x="430" y="115" text-anchor="middle" font-size="9" fill="#a3a3a3">10⁵</text>
              <circle cx="270" cy="48" r="6" fill="#f59e0b"/>
              <text x="270" y="32" text-anchor="middle" font-size="10" font-weight="bold" fill="#d97706">Tú: 1.000</text>
              <circle cx="430" cy="48" r="6" fill="#10b981"/>
              <text x="430" y="32" text-anchor="middle" font-size="10" font-weight="bold" fill="#059669">Real: 100.000</text>
              <line x1="278" y1="48" x2="422" y2="48" stroke="#6366f1" stroke-width="2" stroke-dasharray="5"/>
              <text x="350" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#6366f1">Error = 2</text>
            </svg>
          </div>

          <div class="space-y-2 text-neutral-600">
            <p><strong>Error = 0</strong> → acertaste</p>
            <p><strong>Error = 1</strong> → te equivocaste por un factor de 10</p>
            <p><strong>Error = 2</strong> → te equivocaste por un factor de 100</p>
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
