<script setup>
defineProps({
  show: Boolean
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

        <div class="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 transform">
          <button
            @click="emit('close')"
            class="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <figure class="text-center">
            <img
              src="/fermi_and_sheriff.png"
              alt="Fermi y Sheriff discutiendo órdenes de magnitud"
              class="w-full rounded-lg shadow-md"
            />
            <figcaption class="text-sm text-neutral-500 italic mt-4">
              Fermi: "¿Cuántos pelos tienes en la cabeza?" — Sheriff: "Déjame pensar... Cien mil?"
            </figcaption>
          </figure>

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
