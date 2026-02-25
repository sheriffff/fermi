<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { logDownload } from '@/lib/supabase'

const downloadState = ref('idle') // 'idle' | 'downloading' | 'done'

function handleDownload() {
  downloadState.value = 'downloading'
  const link = document.createElement('a')
  link.href = '/profe_instrucciones_y_tests.pdf'
  link.download = 'profe_instrucciones_y_tests.pdf'
  link.click()
  logDownload().catch(() => {})
  setTimeout(() => {
    downloadState.value = 'done'
    setTimeout(() => { downloadState.value = 'idle' }, 3000)
  }, 800)
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
    <RouterLink to="/" class="inline-block mb-6 text-primary-500 hover:text-primary-600 transition-colors">
      ← Volver al inicio
    </RouterLink>

    <div class="max-w-xl mx-auto">

      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-800">
          Hola Profesor <span class="text-4xl">👩‍🏫</span>
        </h1>
      </div>

      <div class="card text-center space-y-6">
        <div class="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-left">
          <p class="text-sm text-neutral-700 mb-2">
            En el siguiente PDF encontrarás:
          </p>
          <ul class="text-sm text-neutral-600 list-disc list-inside mb-3">
            <li>Instrucciones para el profesor.</li>
            <li>Documentos legales necesarios.</li>
            <li>4 tests diferentes A, B, C y D.</li>
          </ul>
          <p class="text-sm text-amber-700 font-medium">
            Descárgalo e imprímelo a doble cara.
          </p>
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
          <span v-if="downloadState === 'idle'">Descargar PDF</span>
          <span v-else-if="downloadState === 'downloading'">Descargando...</span>
          <span v-else>Descargado ✓</span>
        </button>
      </div>
    </div>
  </div>
</template>
