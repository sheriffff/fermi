<script setup>
import { ref } from 'vue'
import FeedbackModal from './FeedbackModal.vue'

const show = ref(false)
</script>

<template>
  <div class="text-center">
    <button
      @click="show = true"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 bg-white text-neutral-600 text-sm font-medium shadow-sm hover:shadow-md hover:border-primary-300 hover:text-primary-600 transition-all cursor-pointer"
    >
      📣 Dame tu opinión
    </button>
    <FeedbackModal :show="show" @close="show = false" />
  </div>
</template>
