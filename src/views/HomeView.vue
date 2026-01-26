<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-2xl w-full">
      <!-- Logo / Título -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-6">
          <span class="text-4xl">🧮</span>
        </div>
        <h1 class="text-4xl font-bold text-neutral-800 mb-4">
          Problemas de Fermi
        </h1>
        <p class="text-xl text-neutral-600 leading-relaxed">
          Investigando sobre nuestra capacidad de estimación
        </p>
      </div>

      <!-- Descripción del proyecto -->
      <div class="card mb-8">
        <h2 class="text-lg font-semibold text-neutral-700 mb-3">
          ¿De qué va esto?
        </h2>
        <p class="text-neutral-600 leading-relaxed">
          Este estudio forma parte de mi Trabajo Fin de Máster en el Máster de Educación Secundaria.
          Quiero saber qué tal estimamos magnitudes.
        </p>
      </div>

      <!-- Botones principales -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Botón Adultos -->
        <RouterLink
          to="/adultos"
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
            Descarga los materiales para aplicar el test en tu aula
          </p>
        </RouterLink>
      </div>

      <!-- Footer discreto -->
      <div class="text-center mt-12 text-sm text-neutral-400">
      </div>
    </div>
  </div>
</template>
