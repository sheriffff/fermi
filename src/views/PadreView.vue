<script setup>
import { RouterLink } from 'vue-router'
import FeedbackButton from '@/components/common/FeedbackButton.vue'
import { themes, difficulties, colors } from '@/data/padreQuestions.js'
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
    <RouterLink to="/" class="inline-block mb-6 text-primary-500 hover:text-primary-600 transition-colors">
      ← Volver al inicio
    </RouterLink>

    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-800 mb-1">
          Hola Madre / Padre 👨‍👩‍👧
        </h1>
      </div>

      <div class="mb-8 max-w-2xl mx-auto space-y-1.5 text-neutral-600 leading-relaxed">
        <p class="text-lg font-medium text-neutral-800">Las matemáticas aburren a muchos niños y adolescentes.</p>
        <p class="mb-6">Porque nos les ven la utilidad. O porque se las cuentan mal.</p>
        <p>Lo que nos gusta a todos es curiosear, aprender. Y a veces también competir.</p>
        <p class="text-neutral-400 italic text-sm">Sí, a los adolescentes a veces les motiva especialmente ganar a sus padres.</p>
        <p class="mb-6">Pues juguemos en casa. Juguemos en familia.</p>
        <p>Un Problema de Fermi no tiene respuesta incorrecta. Solo estimamos.</p>
        <p>Aquí tienes algunas ideas y preguntas para pensar juntos.</p>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-neutral-200 shadow-sm">
        <table class="w-full border-collapse min-w-[640px]">
          <thead>
            <tr class="bg-neutral-50 border-b border-neutral-200">
              <th class="p-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide w-28"></th>
              <th
                v-for="theme in themes"
                :key="theme.label"
                class="p-3 text-center text-sm font-semibold text-neutral-700"
              >
                <div class="flex flex-col items-center gap-1">
                  <span class="text-xl">{{ theme.emoji }}</span>
                  <span>{{ theme.label }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(d, di) in difficulties"
              :key="d.level"
              :class="di < difficulties.length - 1 ? 'border-b border-neutral-200' : ''"
            >
              <td class="p-3 align-middle">
                <span :class="colors[d.color].badge" class="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                  {{ d.level }}
                </span>
              </td>
              <td
                v-for="(theme, ti) in themes"
                :key="ti"
                :class="[colors[d.color].cell, colors[d.color].border, ti < themes.length - 1 ? 'border-r' : '']"
                class="p-3 text-sm text-neutral-700 align-top transition-colors"
              >
                <span class="italic leading-snug">{{ theme.questions[di] }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6">
        <FeedbackButton />
      </div>

      <p class="mb-6 text-center text-neutral-400 text-md mt-4 italic">
        ¿Se os ocurren preguntas parecidas? Inventaos las vuestras.
      </p>
    </div>
  </div>
</template>
