<script setup>
defineProps({
  to: { type: String, default: '/' },
  label: { type: String, default: 'Volver al inicio' },
})
</script>

<template>
  <RouterLink
    :to="to"
    class="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
    {{ label }}
  </RouterLink>
</template>
