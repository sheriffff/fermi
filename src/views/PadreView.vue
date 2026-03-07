<script setup>
import { RouterLink } from 'vue-router'
import FeedbackButton from '@/components/common/FeedbackButton.vue'

const places = [
  { emoji: '🏠', label: 'En casa' },
  { emoji: '📺', label: 'Viendo la tele' },
  { emoji: '🌳', label: 'Por la calle' },
  { emoji: '🛒', label: 'Supermercado' },
  { emoji: '🚗', label: 'En el coche' },
]

const rows = [
  {
    level: 'Fácil',
    color: 'emerald',
    questions: [
      '¿Cuántos libros caben en tu habitación?',
      '¿Cuántas palabras dice el presentador por minuto?',
      '¿Cuántos pasos hay de aquí a esa esquina?',
      '¿Cuántas latas de tomate hay en ese estante?',
      '¿Cuántos árboles hemos pasado en los últimos 5 minutos?',
    ],
  },
  {
    level: 'Medio',
    color: 'blue',
    questions: [
      '¿Cuántos espaguetis hay en un paquete?',
      '¿Cuántos anuncios has visto en tu vida?',
      '¿Cuántos coches pasan por aquí en un día?',
      '¿Cuántos granos de arroz hay en ese paquete de 1 kg?',
      '¿Cuántos kilómetros recorre este coche al año?',
    ],
  },
  {
    level: 'Difícil',
    color: 'orange',
    questions: [
      '¿Cuántos pelos tienes en la cabeza?',
      '¿Cuántos fotogramas tiene esta película?',
      '¿Cuántas baldosas hay en esta acera?',
      '¿Cuánto pesa toda la comida que hay ahora mismo en este supermercado?',
      '¿Cuántos litros de gasolina has gastado en tu vida?',
    ],
  },
  {
    level: 'Muy difícil',
    color: 'red',
    questions: [
      '¿Cuántos segundos llevas vivo?',
      '¿Cuántos píxeles has visto en toda tu vida?',
      '¿Cuántos ladrillos tiene ese edificio?',
      '¿Cuántas calorías hay en todo el supermercado?',
      '¿Cuántos pasos necesitarías para llegar al Sol caminando?',
    ],
  },
  {
    level: 'Megadesafío',
    color: 'violet',
    questions: [
      '¿Cuántos latidos le quedan a tu corazón si vives hasta los 90?',
      '¿Cuántos bits de información has consumido en tu vida?',
      '¿Cuántos granos de arena hay en todas las playas del mundo?',
      '¿Cuántos átomos hay en el pan de molde que acabas de comprar?',
      '¿Cuántas vueltas a la Tierra has dado en coche a lo largo de tu vida?',
    ],
  },
]

const colors = {
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700',
    cell: 'bg-emerald-50/60 hover:bg-emerald-50',
    border: 'border-emerald-100',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-700',
    cell: 'bg-blue-50/60 hover:bg-blue-50',
    border: 'border-blue-100',
  },
  orange: {
    badge: 'bg-orange-100 text-orange-700',
    cell: 'bg-orange-50/60 hover:bg-orange-50',
    border: 'border-orange-100',
  },
  red: {
    badge: 'bg-red-100 text-red-700',
    cell: 'bg-red-50/60 hover:bg-red-50',
    border: 'border-red-100',
  },
  violet: {
    badge: 'bg-violet-100 text-violet-700',
    cell: 'bg-violet-50/60 hover:bg-violet-50',
    border: 'border-violet-100',
  },
}
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
                v-for="place in places"
                :key="place.label"
                class="p-3 text-center text-sm font-semibold text-neutral-700"
              >
                <div class="flex flex-col items-center gap-1">
                  <span class="text-xl">{{ place.emoji }}</span>
                  <span>{{ place.label }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, ri) in rows"
              :key="row.level"
              :class="ri < rows.length - 1 ? 'border-b border-neutral-200' : ''"
            >
              <td class="p-3 align-middle">
                <span :class="colors[row.color].badge" class="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                  {{ row.level }}
                </span>
              </td>
              <td
                v-for="(q, qi) in row.questions"
                :key="qi"
                :class="[colors[row.color].cell, colors[row.color].border, qi < row.questions.length - 1 ? 'border-r' : '']"
                class="p-3 text-sm text-neutral-700 align-top transition-colors"
              >
                <span class="italic leading-snug">{{ q }}</span>
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
