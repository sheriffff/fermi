<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import ImageModal from '@/components/common/ImageModal.vue'

import { useRouter } from 'vue-router'
import { setDbEnabled } from '@/lib/supabase'

const router = useRouter()
const showImageModal = ref(false)
const showInfoModal = ref(false)

const porClicks = ref(0)
let porTimer = null
function handlePorClick() {
  porClicks.value++
  clearTimeout(porTimer)
  if (porClicks.value >= 3) {
    porClicks.value = 0
    router.push('/admin')
    return
  }
  porTimer = setTimeout(() => { porClicks.value = 0 }, 1000)
}

const fermiClicks = ref(0)
let fermiTimer = null
function handleFermiClick() {
  fermiClicks.value++
  clearTimeout(fermiTimer)
  if (fermiClicks.value >= 3) {
    fermiClicks.value = 0
    setDbEnabled(false)
    document.body.style.backgroundColor = '#fefce8'
    return
  }
  fermiTimer = setTimeout(() => { fermiClicks.value = 0 }, 1000)
}
</script>

<template>
  <div class="min-h-screen flex justify-center p-8 pt-16">
    <div class="max-w-4xl w-full">
      <!-- Logo / Título -->
      <div class="text-center mb-12">
        <h1 class="text-2xl sm:text-4xl font-bold text-neutral-800 mb-4">
          <span aria-hidden="true">🎯 </span>Gymkana de <span @click.prevent="handleFermiClick" class="cursor-default select-none">Fermi</span><span aria-hidden="true"> 🎯</span>
        </h1>
        <p class="text-xl text-neutral-600 leading-relaxed mb-3">
          Explorando el arte de estimar
        </p>
        <div class="flex justify-center gap-4 text-sm">
          <button @click="showInfoModal = true" class="text-neutral-500 hover:text-primary-600 underline underline-offset-2 decoration-neutral-300 hover:decoration-primary-600 transition-colors cursor-pointer">
            🤔 ¿De qué va esto?
          </button>
          <button @click="showImageModal = true" class="text-neutral-500 hover:text-primary-600 underline underline-offset-2 decoration-neutral-300 hover:decoration-primary-600 transition-colors cursor-pointer">
            💡 ¿Cómo empezó todo?
          </button>
        </div>
      </div>

      <ImageModal :show="showImageModal" @close="showImageModal = false" />

      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="showInfoModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
            @click.self="showInfoModal = false"
          >
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform">
              <button
                @click="showInfoModal = false"
                class="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 class="text-2xl font-bold text-neutral-800 mb-4">¿De qué va esto? 🤔</h2>
              <p class="text-neutral-600 leading-relaxed mb-2">
                — ¿Cuántos McDonald's hay en el mundo?
              </p>
              <p class="text-neutral-600 leading-relaxed mb-2">
                — ¿Cuántos granos de arroz entran en una botella de vino?
              </p>
              <p class="text-neutral-600 leading-relaxed mb-7">
                — ¿Cuánta leche produce una vaca en su vida?
              </p>
              <p class="text-neutral-600 leading-relaxed mb-7">
                Este tipo de problemas de estimación son conocidos como <a href="https://es.wikipedia.org/wiki/Problema_de_Fermi" target="_blank" class="text-primary-600 hover:underline">Problemas de Fermi</a>, uno de los pocos grandes físicos teóricos y a la vez experimentales de la historia.
              </p>
              <p class="text-neutral-600 leading-relaxed">
                Esta aplicación web la hice para que tú juegues a estimar cantidades. Y forma parte de un proyecto más grande,
                mi TFM del Máster del Profesorado, donde investigo sobre la capacidad de estimación de los adolescentes.
              </p>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- CTA Principal -->
      <RouterLink
        to="/test"
        class="block mb-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 group border border-emerald-200"
      >
        <span class="text-4xl md:text-5xl inline-block group-hover:scale-110 transition-transform duration-300 mb-3">☝️</span>
        <h3 class="text-xl md:text-2xl font-bold mb-1">Quiero Participar</h3>
        <p class="text-emerald-600 text-sm">Pon a prueba tu capacidad de estimación (~10 min)</p>
      </RouterLink>

      <!-- Acciones secundarias -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RouterLink
          to="/profe"
          class="card-elevated group hover:shadow-xl transition-all duration-300 cursor-pointer text-center"
        >
          <div class="mb-3">
            <span class="text-4xl group-hover:scale-110 transition-transform duration-300 inline-block">👩‍🏫</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-800 mb-1">Soy Profesor</h3>
          <p class="text-neutral-500 text-xs">Descarga los tests para tu aula</p>
        </RouterLink>

        <RouterLink
          to="/random"
          class="card-elevated group hover:shadow-xl transition-all duration-300 cursor-pointer text-center"
        >
          <div class="mb-3">
            <span class="text-4xl group-hover:scale-110 transition-transform duration-300 inline-block">🎲</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-800 mb-1">Pregunta Aleatoria</h3>
          <p class="text-neutral-500 text-xs">Una pregunta rápida para probar</p>
        </RouterLink>

        <div class="card-elevated text-center opacity-50 cursor-not-allowed">
          <div class="mb-3">
            <span class="text-4xl inline-block grayscale">📊</span>
          </div>
          <h3 class="text-lg font-semibold text-neutral-800 mb-1">Resultados</h3>
          <p class="text-neutral-500 text-xs">¿Qué tal estimamos?</p>
          <span class="inline-block mt-2 text-xs text-neutral-900 font-semibold bg-neutral-100 px-2 py-1 rounded-full">~mayo 2026</span>
        </div>
      </div>

      <div class="text-center mt-12 text-sm text-neutral-500">
        <span @click.prevent="handlePorClick" class="cursor-default select-none">por</span> <a href="https://www.linkedin.com/in/sheriff-data" target="_blank" class="text-primary-600 hover:underline">Manuel López Sheriff</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
