<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import ImageModal from '@/components/common/ImageModal.vue'

const showImageModal = ref(false)
const showInfoModal = ref(false)
</script>

<template>
  <div class="min-h-screen flex justify-center p-8 pt-16">
    <div class="max-w-4xl w-full">
      <!-- Logo / Título -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-neutral-800 mb-4">
          Problemas de Fermi
        </h1>
        <p class="text-xl text-neutral-600 leading-relaxed">
          Investigando sobre nuestra capacidad de estimación
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div
          class="card cursor-pointer text-center"
          @click="showInfoModal = true"
        >
          <div class="text-2xl mb-1">🤔</div>
          <span class="text-lg font-semibold text-neutral-700">¿De qué va esto?</span>
        </div>

        <div
          class="card cursor-pointer text-center"
          @click="showImageModal = true"
        >
          <div class="text-2xl mb-1">💡</div>
          <span class="text-lg font-semibold text-neutral-700">¿Cómo empezó todo?</span>
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
              <h2 class="text-2xl font-bold text-neutral-800 mb-4">¿De qué va esto?</h2>
              <p class="text-neutral-600 leading-relaxed mb-3">
                ¿Cuántos bebés nacen en Europa en un año?
              </p>
              <p class="text-neutral-600 leading-relaxed mb-3">
                ¿Cuántos litros de agua se consumen en España al día?
              </p>
              <p class="text-neutral-600 leading-relaxed mb-3">
                Este tipo de problemas de estimación, son conocidas como <a href="https://es.wikipedia.org/wiki/Problema_de_Fermi" target="_blank" class="text-primary-600 hover:underline">Problemas de Fermi</a>.
              </p>
              <p class="text-neutral-600 leading-relaxed">
                Esta aplicación web sirve de apoyo para un estudio sobre la capacidad de estimación de los adolescentes para mi
                Trabajo Fin de Máster en el Máster de Educación Secundaria.
              </p>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Botones principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Botón Adultos -->
        <RouterLink
          to="/test"
          class="card-elevated group hover:shadow-xl transition-all duration-300 cursor-pointer text-center"
        >
          <div class="mb-4">
            <span class="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">🎯</span>
          </div>
          <h3 class="text-xl font-semibold text-neutral-800 mb-2">
            Quiero Participar
          </h3>
          <p class="text-neutral-500 text-sm">
            Haz un test online (~20 minutos)
          </p>
        </RouterLink>

        <!-- Botón Profesor -->
        <RouterLink
          to="/profe"
          class="card-elevated group hover:shadow-xl transition-all duration-300 cursor-pointer text-center"
        >
          <div class="mb-4">
            <span class="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">👩‍🏫</span>
          </div>
          <h3 class="text-xl font-semibold text-neutral-800 mb-2">
            Soy Profesor
          </h3>
          <p class="text-neutral-500 text-sm">
            Descarga los materiales para pasar los tests en tu aula
          </p>
        </RouterLink>

        <!-- Botón Pregunta Aleatoria -->
        <RouterLink
          to="/random"
          class="card-elevated group hover:shadow-xl transition-all duration-300 cursor-pointer text-center"
        >
          <div class="mb-4">
            <span class="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">🎲</span>
          </div>
          <h3 class="text-xl font-semibold text-neutral-800 mb-2">
            Pregunta Aleatoria
          </h3>
          <p class="text-neutral-500 text-sm">
            Prueba!
          </p>
        </RouterLink>

        <!-- Botón Admin -->
        <RouterLink
          to="/admin"
          class="card-elevated group hover:shadow-xl transition-all duration-300 cursor-pointer text-center"
        >
          <div class="mb-4">
            <span class="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">🤠</span>
          </div>
          <h3 class="text-xl font-semibold text-neutral-800 mb-2">
            Soy Admin
          </h3>
          <p class="text-neutral-500 text-sm">
            Panel de administración
          </p>
        </RouterLink>
      </div>

      <div class="text-center mt-12 text-sm text-neutral-500">
        por <a href="https://www.linkedin.com/in/sheriff-data" target="_blank" class="text-primary-600 hover:underline">Manuel López Sheriff</a>
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
