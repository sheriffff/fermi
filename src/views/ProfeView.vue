<script setup>
import { ref } from 'vue'
import { logDownload } from '@/lib/supabase'
import BackButton from '@/components/common/BackButton.vue'

const downloadState = ref('idle') // 'idle' | 'downloading' | 'done'

const files = [
  { href: '/pdfs/Hoja Instrucciones Profes.pdf', name: 'Hoja Instrucciones Profes.pdf' },
  { href: '/pdfs/Tests_ABCD.pdf', name: 'Tests_ABCD.pdf' },
  { href: '/pdfs/Docs_Alumnado.pdf', name: 'Docs_Alumnado.pdf' },
]

function handleDownload() {
  downloadState.value = 'downloading'
  files.forEach(({ href, name }, i) => {
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = href
      link.download = name
      link.click()
    }, i * 600)
  })
  logDownload().catch(() => {})
  setTimeout(() => {
    downloadState.value = 'done'
    setTimeout(() => { downloadState.value = 'idle' }, 3000)
  }, files.length * 600 + 200)
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

      <div class="card text-center space-y-6">
        <div class="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-left">
          <p class="text-sm text-neutral-700 mb-2">
            Se descargarán 3 PDFs:
          </p>
          <ul class="text-sm text-neutral-600 list-disc list-inside mb-3">
            <li>Hoja de instrucciones para ti.</li>
            <li>Los 4 modelos de test (A, B, C y D).</li>
            <li>Hoja informativa y Consentimiento informado.</li>
          </ul>
        </div>

        <button
          @click="handleDownload"
          class="btn-large w-full transition-all duration-300"
          :class="{
            'btn-primary': downloadState !== 'done',
            'bg-emerald-500 text-white rounded-2xl font-medium': downloadState === 'done'
          }"
          :disabled="downloadState === 'downloading'"
        >
          <span v-if="downloadState === 'idle'">Descargar PDFs</span>
          <span v-else-if="downloadState === 'downloading'">Descargando...</span>
          <span v-else>Descargados ✓</span>
        </button>
      </div>
    </div>
  </div>
</template>
