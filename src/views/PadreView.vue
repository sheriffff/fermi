<script setup>
import { ref } from 'vue'
import FeedbackButton from '@/components/common/FeedbackButton.vue'
import BackButton from '@/components/common/BackButton.vue'
import { themes, difficulties, colors } from '@/config/padreQuestions.js'

const selectedTheme = ref(null)

function selectTheme(index) {
  selectedTheme.value = selectedTheme.value === index ? null : index
}
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
    <BackButton />

    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-800 mb-1">
          Hola Madre / Padre 👨‍👩‍👧
        </h1>
      </div>

      <div class="mb-8 space-y-1.5 text-neutral-600 leading-relaxed">
        <p class="text-lg font-medium text-neutral-800">Las matemáticas aburren a muchos niños y adolescentes.</p>
        <p class="mb-6">Porque nos les ven la utilidad. O porque se las cuentan mal.</p>
        <p>Lo que nos gusta a todos es curiosear, aprender. Y a veces también competir.</p>
        <p class="text-neutral-400 italic text-sm">Sí, a los chavales les motiva especialmente ganar a sus padres.</p>
        <p class="mb-6">Pues juguemos en casa. Juguemos en familia.</p>
        <p>Un Problema de Fermi no tiene respuesta incorrecta. Solo estimamos.</p>
        <p>Aquí tienes algunas ideas y preguntas para pensar juntos.</p>
      </div>

      <div class="grid grid-cols-5 gap-2 mb-6">
        <button
          v-for="(theme, i) in themes"
          :key="i"
          @click="selectTheme(i)"
          :class="[
            'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer',
            selectedTheme === i
              ? 'border-neutral-800 bg-neutral-800 text-white shadow-md'
              : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50'
          ]"
        >
          <span class="text-2xl">{{ theme.emoji }}</span>
          <span class="text-xs font-medium text-center leading-tight">{{ theme.label }}</span>
        </button>
      </div>

      <div v-if="selectedTheme !== null" class="space-y-2">
        <div
          v-for="(d, di) in difficulties"
          :key="d.level"
          :class="colors[d.color].cell"
          class="rounded-xl p-4 flex items-start gap-3"
        >
          <span :class="colors[d.color].badge" class="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 mt-0.5 w-28 text-center">
            {{ d.level }}
          </span>
          <span class="text-sm text-neutral-700 italic leading-snug">
            {{ themes[selectedTheme].questions[di] }}
          </span>
        </div>
      </div>

      <div v-else class="text-center text-neutral-400 text-sm py-8">
        Elige un tema para ver las preguntas
      </div>

      <p class="mb-6 text-center text-neutral-400 text-md mt-6 italic">
        ¿Se os ocurren preguntas parecidas? Inventaos las vuestras.
      </p>

      <FeedbackButton />
    </div>
  </div>
</template>
