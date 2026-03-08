<script setup>
import { APP_URL } from '@/config/app.js'

const canShare = !!navigator.share

async function share() {
  try {
    await navigator.share({
      title: '🎯 Gymkana de Fermi 🎯',
      text: 'Acabo de hacer un test de estimación de cantidades muy entretenido. ¿Te animas?',
      url: APP_URL
    })
  } catch (e) {
    // user cancelled share
  }
}
</script>

<template>
  <button
    v-if="canShare"
    @click="share"
    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 bg-white text-neutral-600 text-sm font-medium shadow-sm hover:shadow-md hover:border-primary-300 hover:text-primary-600 transition-all cursor-pointer"
  >
    📤 Compartir con un amigo
  </button>
</template>
