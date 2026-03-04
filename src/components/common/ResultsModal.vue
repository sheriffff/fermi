<script setup>
import { ref, watch } from 'vue'
import { saveResultsEmail } from '@/lib/supabase'

const props = defineProps({
  show: { type: Boolean, required: true }
})

const emit = defineEmits(['close'])

const email = ref('')
const sending = ref(false)
const sent = ref(false)

watch(() => props.show, (val) => {
  if (val) {
    email.value = ''
    sending.value = false
    sent.value = false
  }
})

async function submit() {
  if (!email.value.trim()) return
  sending.value = true
  try {
    await saveResultsEmail(email.value.trim())
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
            <h2 class="text-2xl font-bold text-neutral-800 mb-2">📊 Resultados</h2>
            <p class="text-neutral-600 mb-1">
              Aún estoy recopilando datos!
            </p>
            <p class="text-neutral-600 mb-5">
              Espero tener los resultados hacia <span class="font-semibold text-neutral-700">Mayo 2026</span>
            </p>

            <label class="block mb-5">
              <span class="text-neutral-600">Si quieres, te envío un correo cuando los tenga</span>
              <input
                v-model="email"
                type="email"
                maxlength="200"
                class="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="tu@email.com"
                @keyup.enter="submit"
              />
            </label>

            <button
              @click="submit"
              :disabled="!email.trim() || sending"
              class="w-full py-2.5 rounded-lg font-semibold text-white transition-colors"
              :class="!email.trim() || sending
                ? 'bg-neutral-300 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'"
            >
              {{ sending ? 'Guardando...' : 'Avisadme' }}
            </button>
          </template>

          <template v-else>
            <div class="text-center py-8">
              <span class="text-5xl mb-4 block">📬</span>
              <p class="text-xl font-semibold text-neutral-800">¡Apuntado!</p>
              <p class="text-neutral-500 text-sm mt-1">Te escribiré cuando estén listos</p>
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
