<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { supabase } from '@/lib/supabase'

const isAuthenticated = ref(false)
const passwordInput = ref('')
const authError = ref(false)
const loading = ref(false)

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handleLogin() {
  loading.value = true
  authError.value = false

  const { data, error } = await supabase
    .from('admin_config')
    .select('password_hash')
    .eq('id', 1)
    .single()

  if (error || !data) {
    authError.value = true
    loading.value = false
    return
  }

  const inputHash = await hashPassword(passwordInput.value)

  if (inputHash === data.password_hash) {
    isAuthenticated.value = true
  } else {
    authError.value = true
  }
  loading.value = false
}
</script>

<template>
<!--  <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center bg-neutral-50">-->
<!--    <div class="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full mx-4">-->
<!--      <h1 class="text-xl font-bold text-neutral-800 mb-6 text-center">-->
<!--        Acceso restringido-->
<!--      </h1>-->

<!--      <form @submit.prevent="handleLogin" class="space-y-4">-->
<!--        <input-->
<!--          v-model="passwordInput"-->
<!--          type="password"-->
<!--          class="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none text-center"-->
<!--          placeholder="Contraseña"-->
<!--          autofocus-->
<!--        />-->

<!--        <div v-if="authError" class="text-red-500 text-sm text-center">-->
<!--          Contraseña incorrecta-->
<!--        </div>-->

<!--        <button-->
<!--          type="submit"-->
<!--          :disabled="loading"-->
<!--          class="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"-->
<!--        >-->
<!--          {{ loading ? 'Verificando...' : 'Entrar' }}-->
<!--        </button>-->
<!--      </form>-->
<!--    </div>-->
<!--  </div>-->
<!--  -->
<!--  <RouterView v-else />-->
    <RouterView/>
</template>

<style>
/* Global styles are handled by Tailwind in main.css */
</style>
