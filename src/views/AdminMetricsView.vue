<script setup>
import { ref, onMounted } from 'vue'
import { getTableCount, getTableLatest } from '@/lib/supabase'

const loading = ref(true)
const error = ref('')

const groups = [
  {
    title: 'Online',
    tables: [
      { key: 'users_online', label: 'Test' },
      { key: 'responses_play_random', label: 'Pregunta Aleatoria' },
      { key: 'scribbles', label: 'Uploaded Images' }
    ]
  },
  {
    title: 'Profes',
    tables: [
      { key: 'logs_download', label: 'Descargas PDF' }
    ]
  },
  {
    title: 'Feedback',
    tables: [
      { key: 'feedback', label: 'Mensajes' }
    ]
  },
  {
    title: 'Papel',
    tables: [
      { key: 'users_paper', label: 'Alumnos' }
    ]
  }
]

const allTables = groups.flatMap(g => g.tables)

const counts = ref({})
const latests = ref({})

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    await Promise.all(allTables.map(async t => {
      const [count, latest] = await Promise.all([
        getTableCount(t.key),
        getTableLatest(t.key)
      ])
      counts.value[t.key] = count
      latests.value[t.key] = latest
    }))
  } catch (e) {
    console.error('Error cargando métricas:', e)
    error.value = 'Error al cargar métricas'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-bold text-neutral-800">Métricas</h2>
      <p class="text-neutral-500 text-sm">Resumen de datos en Supabase</p>
    </div>

    <div v-if="loading" class="text-center py-12 text-neutral-400">
      Cargando métricas...
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-500">
      {{ error }}
    </div>

    <div v-else>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div v-for="group in groups" :key="group.title">
          <h3 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{{ group.title }}</h3>
          <div class="space-y-3">
            <div v-for="t in group.tables" :key="t.key" class="card text-center">
              <div class="text-3xl font-bold text-primary-500">{{ counts[t.key] ?? '-' }}</div>
              <div class="text-sm font-medium text-neutral-700 mt-1">{{ t.label }}</div>
              <div class="text-xs text-neutral-400 mt-1">{{ formatDate(latests[t.key]) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
