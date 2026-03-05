<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getTableRecent, getTableCountsByDay, getTableCountsByWeek, getAllScribbleUrls, exportTable } from '@/lib/supabase'

const route = useRoute()
const tableKey = computed(() => route.params.tableKey)

const loading = ref(true)
const error = ref('')
const recentRows = ref([])
const dailyCounts = ref([])
const weeklyCounts = ref([])
const scribbleUrls = ref([])

const TABLE_CONFIG = {
  users_online: {
    label: 'Test Online',
    select: 'user_alias, device_type, created_at',
    columns: ['created_at', 'device_type', 'user_alias'],
    columnLabels: ['Fecha', 'Dispositivo', 'Alias'],
    hasCharts: true,
    hasDeviceChart: true
  },
  responses_play_random: {
    label: 'Pregunta Aleatoria',
    select: 'time, device_type, created_at',
    columns: ['created_at', 'device_type', 'time'],
    columnLabels: ['Fecha', 'Dispositivo', 'Tiempo'],
    hasCharts: true,
    hasDeviceChart: true
  },
  scribbles: {
    label: 'Imágenes Subidas',
    special: 'images'
  },
  logs_download: {
    label: 'Descargas PDF',
    select: 'created_at',
    columns: ['created_at'],
    columnLabels: ['Fecha'],
    hasCharts: true
  },
  feedback: {
    label: 'Mensajes',
    select: 'name, message, created_at',
    special: 'feedback'
  },
  users_paper: {
    label: 'Alumnos Papel',
    select: 'age, sex, test_model, created_at',
    columns: ['age', 'sex', 'test_model', 'created_at'],
    columnLabels: ['Edad', 'Sexo', 'Modelo', 'Fecha'],
    hasCharts: true
  }
}

const config = computed(() => TABLE_CONFIG[tableKey.value] || { label: tableKey.value })
const maxDaily = computed(() => Math.max(...dailyCounts.value.map(d => d.count), 1))
const maxWeekly = computed(() => Math.max(...weeklyCounts.value.map(d => d.count), 1))

const allDevices = ref([])
const deviceCounts = computed(() => {
  const counts = {}
  for (const d of allDevices.value) {
    counts[d] = (counts[d] || 0) + 1
  }
  return Object.entries(counts).map(([device, count]) => ({ device, count }))
})
const maxDevice = computed(() => Math.max(...deviceCounts.value.map(d => d.count), 1))

const lightboxUrl = ref(null)

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatShortDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatCell(value, col) {
  if (col === 'created_at') return formatDate(value)
  if (value === null || value === undefined) return '-'
  return value
}

onMounted(async () => {
  const cfg = config.value
  try {
    const promises = []

    if (cfg.special === 'images') {
      promises.push(getAllScribbleUrls().then(d => { scribbleUrls.value = d }))
    } else if (cfg.special === 'feedback') {
      promises.push(getTableRecent(tableKey.value, 50, cfg.select).then(d => { recentRows.value = d }))
    } else {
      if (cfg.select) {
        promises.push(getTableRecent(tableKey.value, 10, cfg.select).then(d => { recentRows.value = d }))
      }
      if (cfg.hasDeviceChart) {
        promises.push(exportTable(tableKey.value).then(d => {
          allDevices.value = d.map(r => r.device_type || 'unknown')
        }))
      }
      if (cfg.hasCharts) {
        promises.push(getTableCountsByDay(tableKey.value, 7).then(d => { dailyCounts.value = d }))
        const fourWeeksAgo = new Date()
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
        promises.push(getTableCountsByWeek(tableKey.value, fourWeeksAgo.toISOString().split('T')[0]).then(d => {
          const weeks = []
          for (let i = 3; i >= 0; i--) {
            const dt = new Date()
            dt.setDate(dt.getDate() - i * 7)
            const jan1 = new Date(dt.getFullYear(), 0, 1)
            const week = Math.ceil(((dt - jan1) / 86400000 + jan1.getDay() + 1) / 7)
            const key = `${dt.getFullYear()}-W${String(week).padStart(2, '0')}`
            const existing = d.find(w => w.week === key)
            weeks.push({ week: key, count: existing ? existing.count : 0 })
          }
          weeklyCounts.value = weeks
        }))
      }
    }

    await Promise.all(promises)
  } catch (e) {
    console.error('Error loading detail:', e)
    error.value = 'Error al cargar datos'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <RouterLink to="/admin/metricas" class="text-sm text-primary-500 hover:text-primary-700">
        ← Volver a métricas
      </RouterLink>
      <h2 class="text-xl font-bold text-neutral-800 mt-2">{{ config.label }}</h2>
    </div>

    <div v-if="loading" class="text-center py-12 text-neutral-400">Cargando...</div>
    <div v-else-if="error" class="text-center py-12 text-red-500">{{ error }}</div>

    <div v-else class="space-y-8">
      <!-- Recent rows table -->
      <div v-if="config.columns && recentRows.length" class="card overflow-x-auto">
        <h3 class="text-sm font-semibold text-neutral-500 mb-3">Últimos 10</h3>
        <table class="text-sm">
          <thead>
            <tr>
              <th v-for="(label, i) in config.columnLabels" :key="i" class="text-left text-xs font-medium text-neutral-400 uppercase pb-2 pr-8 max-w-52">{{ label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in recentRows" :key="i" class="border-t border-neutral-100">
              <td v-for="col in config.columns" :key="col" class="py-2 pr-8 text-neutral-700 max-w-52">{{ formatCell(row[col], col) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Charts side by side -->
      <div v-if="config.hasCharts" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div v-if="dailyCounts.length" class="card">
          <h3 class="text-sm font-semibold text-neutral-500 mb-4">Últimos 7 días</h3>
          <div class="flex items-end gap-2 h-40">
            <div v-for="d in dailyCounts" :key="d.date" class="flex-1 flex flex-col items-center justify-end h-full">
              <span class="text-xs font-medium text-neutral-600 mb-1">{{ d.count }}</span>
              <div
                class="w-full bg-primary-400 rounded-t transition-all"
                :style="{ height: (d.count / maxDaily * 100) + '%', minHeight: d.count > 0 ? '4px' : '0' }"
              ></div>
              <span class="text-xs text-neutral-400 mt-1 whitespace-nowrap">{{ formatShortDate(d.date) }}</span>
            </div>
          </div>
        </div>

        <div v-if="weeklyCounts.length" class="card">
          <h3 class="text-sm font-semibold text-neutral-500 mb-4">Últimas 4 semanas</h3>
          <div class="flex items-end gap-2 h-40">
            <div v-for="w in weeklyCounts" :key="w.week" class="flex-1 flex flex-col items-center justify-end h-full">
              <span class="text-xs font-medium text-neutral-600 mb-1">{{ w.count }}</span>
              <div
                class="w-full bg-emerald-400 rounded-t transition-all"
                :style="{ height: (w.count / maxWeekly * 100) + '%', minHeight: w.count > 0 ? '4px' : '0' }"
              ></div>
              <span class="text-xs text-neutral-400 mt-1 whitespace-nowrap">{{ w.week }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Device countplot -->
      <div v-if="config.hasDeviceChart && deviceCounts.length" class="card sm:w-1/2">
        <h3 class="text-sm font-semibold text-neutral-500 mb-4">Dispositivos</h3>
        <div class="flex items-end gap-4 h-32">
          <div v-for="d in deviceCounts" :key="d.device" class="flex-1 flex flex-col items-center justify-end h-full max-w-32">
            <span class="text-xs font-medium text-neutral-600 mb-1">{{ d.count }}</span>
            <div
              class="w-full rounded-t transition-all"
              :class="d.device === 'desktop' ? 'bg-neutral-800' : 'bg-neutral-400'"
              :style="{ height: (d.count / maxDevice * 100) + '%', minHeight: d.count > 0 ? '4px' : '0' }"
            ></div>
            <span class="text-xs text-neutral-400 mt-1">{{ d.device }}</span>
          </div>
        </div>
      </div>

      <!-- Scribbles grid -->
      <div v-if="config.special === 'images'">
        <div v-if="scribbleUrls.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div v-for="(img, i) in scribbleUrls" :key="i" class="card p-2 cursor-pointer" @click="lightboxUrl = img.url">
            <img :src="img.url" class="w-full h-40 object-cover rounded" loading="lazy" />
            <p class="text-xs text-neutral-400 mt-1 text-center">{{ formatDate(img.created_at) }}</p>
          </div>
        </div>
        <p v-else class="text-neutral-400 text-sm">No hay imágenes</p>
      </div>

      <!-- Feedback list -->
      <div v-if="config.special === 'feedback'">
        <div v-if="recentRows.length" class="space-y-3">
          <div v-for="(row, i) in recentRows" :key="i" class="card">
            <div class="flex justify-between items-start mb-1">
              <span class="font-medium text-neutral-700">{{ row.name || 'Anónimo' }}</span>
              <span class="text-xs text-neutral-400">{{ formatDate(row.created_at) }}</span>
            </div>
            <p class="text-sm text-neutral-600">{{ row.message }}</p>
          </div>
        </div>
        <p v-else class="text-neutral-400 text-sm">No hay mensajes</p>
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="lightboxUrl" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" @click="lightboxUrl = null">
      <img :src="lightboxUrl" class="max-w-full max-h-full object-contain rounded-lg" @click.stop />
    </div>
  </div>
</template>
