<script setup>
import { ref, watch } from 'vue'
import { saveFeedback } from '@/lib/supabase'

const props = defineProps({
  show: { type: Boolean, required: true }
})

const emit = defineEmits(['close'])

const name = ref('')
const message = ref('')
const sending = ref(false)
const sent = ref(false)

watch(() => props.show, (val) => {
  if (val) {
    name.value = ''
    message.value = ''
    sending.value = false
    sent.value = false
  }
})

async function submit() {
  if (!message.value.trim()) return
  sending.value = true
  try {
    await saveFeedback({ name: name.value.trim(), message: message.value.trim() })
  } catch {
    // silent
  }
  sent.value = true
  setTimeout(() => emit('close'), 1500)
}
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

          <template v-if="!sent">
            <h2 class="text-2xl font-bold text-neutral-800 mb-4">📣 Dame tu opinión</h2>
            <p class="text-neutral-600 mb-5">Todo feedback es bienvenido!</p>
            <label class="block mb-3">
              <span class="text-sm text-neutral-600">Nombre (opcional)</span>
              <input
                v-model="name"
                type="text"
                maxlength="100"
                class="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="Tu nombre"
              />
            </label>

            <label class="block mb-5">
              <span class="text-sm text-neutral-600">Mensaje <span class="text-red-400">*</span></span>
              <textarea
                v-model="message"
                rows="4"
                maxlength="2000"
                class="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                placeholder="¿Qué te ha parecido?"
              ></textarea>
            </label>

            <button
              @click="submit"
              :disabled="!message.trim() || sending"
              class="w-full py-2.5 rounded-lg font-semibold text-white transition-colors"
              :class="!message.trim() || sending
                ? 'bg-neutral-300 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'"
            >
              {{ sending ? 'Enviando...' : 'Enviar' }}
            </button>
          </template>

          <template v-else>
            <div class="text-center py-8">
              <span class="text-5xl mb-4 block">🙏</span>
              <p class="text-xl font-semibold text-neutral-800">¡Gracias!</p>
            </div>
          </template>
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
