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
        <div
          v-for="file in files"
          :key="file.href"
          class="flex flex-col items-center gap-2 px-3 py-5 rounded-xl bg-primary-50 border border-primary-200 text-primary-800 font-medium text-center"
        >
          <span class="text-3xl">{{ file.icon }}</span>
          <span class="text-sm leading-snug flex-1">{{ file.label }}</span>
          <span v-if="file.note" class="text-sm text-red-500 font-semibold leading-snug">{{ file.note }}</span>
          <button
            @click="handleDownload(file.href)"
            class="mt-1 flex items-center gap-1 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors cursor-pointer w-full justify-center"
          >
            ⬇️ Descargar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
