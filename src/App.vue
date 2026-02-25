<script setup>
import { RouterView } from 'vue-router'

const isWip = import.meta.env.VITE_WIP === 'true'
</script>

<template>
  <div v-if="isWip" class="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
    <img src="/wip.jpeg" alt="Work in progress" class="w-100 max-w-full rounded-2xl shadow-lg" />
    <h1 class="mt-6 text-2xl font-bold text-neutral-700">Próximamente (~15 Marzo 2026)</h1>
    <p class="mt-2 text-neutral-500">Estamos trabajando en ello</p>
  </div>
  <RouterView v-else />
</template>

<style>
/* Global styles are handled by Tailwind in main.css */
</style>
