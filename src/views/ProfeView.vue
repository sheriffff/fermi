<script setup>
import { logDownload } from '@/lib/supabase'
import BackButton from '@/components/common/BackButton.vue'

const files = [
  { href: '/pdfs/Hoja Instrucciones Profes.pdf', label: 'Instrucciones para ti', icon: '📋' },
  { href: '/pdfs/Tests_ABCD.pdf', label: 'Tests: A, B, C, D', icon: '📝', note: '⚠️ Imprime a doble cara' },
  { href: '/pdfs/Docs_Alumnado.pdf', label: 'Hoja informativa y consentimiento', icon: '📄' },
]

function handleDownload(href) {
  const link = document.createElement('a')
  link.href = href
  link.download = href.split('/').pop()
  link.click()
  logDownload().catch(() => {})
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
    <BackButton />

    <div class="max-w-xl mx-auto">

      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-800">
          Hola Profe <span class="text-4xl">👩‍🏫</span>
        </h1>
      </div>

      <p class="text-md text-neutral-1000 text-center mb-4">Descarga estos 3 documentos:</p>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="file in files"
          :key="file.href"
          @click="handleDownload(file.href)"
          class="flex flex-col items-center gap-2 px-3 py-5 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-800 font-medium transition-all duration-200 hover:shadow-md text-center group"
        >
          <span class="text-3xl">{{ file.icon }}</span>
          <span class="text-xs leading-snug">{{ file.label }}</span>
          <span v-if="file.note" class="text-xs text-red-500 font-semibold leading-snug">{{ file.note }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
