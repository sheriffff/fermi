<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isAuthenticated = ref(false)
const passwordInput = ref('')
const authError = ref(false)

const ADMIN_PASSWORD_HASH = 'a06cd80a62f31eeee3da744d28e7071227e6e5faeda82b91659ff4705949cde8'

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handleLogin() {
  const inputHash = await hashPassword(passwordInput.value)
  if (inputHash === ADMIN_PASSWORD_HASH) {
    isAuthenticated.value = true
    authError.value = false
  } else {
    authError.value = true
  }
}

const hubLinks = [
  { to: '/admin/datos', label: 'Insertar Datos', desc: 'Entrada de exámenes en papel', icon: '📝' },
  { to: '/admin/metricas', label: 'Métricas', desc: 'Resumen de datos en Supabase', icon: '📊' },
  { to: '/admin/exportar', label: 'Exportar CSV', desc: 'Descarga tablas y vistas', icon: '📥' },
  { to: '/admin/dificultad', label: 'Votar Dificultad', desc: 'Ranking por comparación por pares', icon: '⚖️' }
]
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 md:p-8">
    <RouterLink :to="route.path === '/admin' ? '/' : '/admin'" class="inline-block mb-6 text-primary-500 hover:text-primary-600 transition-colors">
      ← {{ route.path === '/admin' ? 'Volver al inicio' : 'Volver al panel' }}
    </RouterLink>

    <div v-if="!isAuthenticated" class="max-w-md mx-auto mt-12">
      <div class="card text-center">
        <div class="text-4xl mb-4">🔐</div>
        <h1 class="text-2xl font-bold text-neutral-800 mb-6">
          Panel de Administración
        </h1>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <input
            v-model="passwordInput"
            type="password"
            class="input text-center"
            placeholder="Contraseña"
            autofocus
          />

          <div v-if="authError" class="text-red-500 text-sm">
            Contraseña incorrecta
          </div>

          <button type="submit" class="btn-primary w-full">
            Entrar
          </button>
        </form>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-neutral-800">
            Panel de Administración
          </h1>
        </div>

      </div>

      <div v-if="route.path === '/admin'">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <RouterLink
            v-for="link in hubLinks"
            :key="link.to"
            :to="link.to"
            class="card hover:shadow-lg transition-shadow text-center group"
          >
            <div class="text-4xl mb-3">{{ link.icon }}</div>
            <h2 class="text-lg font-bold text-neutral-800 group-hover:text-primary-500 transition-colors">
              {{ link.label }}
            </h2>
            <p class="text-sm text-neutral-500 mt-1">{{ link.desc }}</p>
          </RouterLink>
        </div>
      </div>

      <router-view v-else />
    </div>
  </div>
</template>
