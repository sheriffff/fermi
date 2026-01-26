<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { obtenerGrupos, guardarRespuestasPapel, exportarTabla } from '@/lib/supabase'
import { useNumberFormat } from '@/composables/useNumberFormat'

// ============================================
// AUTENTICACIÓN SIMPLE
// ============================================
const isAuthenticated = ref(false)
const passwordInput = ref('')
const authError = ref(false)

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'fermi2026'

function handleLogin() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    isAuthenticated.value = true
    authError.value = false
  } else {
    authError.value = true
  }
}

// ============================================
// ESTADO DEL PANEL
// ============================================
const grupos = ref([])
const selectedGrupo = ref('')
const selectedModelo = ref('A')
const numAlumnos = ref(5)
const isLoading = ref(false)
const saveStatus = ref('') // 'saving' | 'saved' | 'error'

// Grid de datos: estructura para entrada rápida
// Cada fila es un alumno, cada columna es una pregunta con base y exponente
const NUM_PREGUNTAS = 8
const gridData = ref([])

// ============================================
// COMPOSABLES
// ============================================
const { fromScientificNotation, formatNumber } = useNumberFormat()

// ============================================
// COMPUTED
// ============================================
const grupoSeleccionado = computed(() => {
  return grupos.value.find(g => g.id === selectedGrupo.value)
})

// ============================================
// MÉTODOS
// ============================================

async function cargarGrupos() {
  try {
    const data = await obtenerGrupos()
    grupos.value = data || []
  } catch (e) {
    console.error('Error cargando grupos:', e)
  }
}

function initializeGrid() {
  gridData.value = []
  for (let i = 0; i < numAlumnos.value; i++) {
    const row = {
      alumnoIdx: i + 1,
      preguntas: []
    }
    for (let p = 0; p < NUM_PREGUNTAS; p++) {
      row.preguntas.push({
        base: '',
        exp: ''
      })
    }
    gridData.value.push(row)
  }
}

function addRow() {
  numAlumnos.value++
  const newRow = {
    alumnoIdx: gridData.value.length + 1,
    preguntas: []
  }
  for (let p = 0; p < NUM_PREGUNTAS; p++) {
    newRow.preguntas.push({ base: '', exp: '' })
  }
  gridData.value.push(newRow)
}

function removeLastRow() {
  if (gridData.value.length > 1) {
    gridData.value.pop()
    numAlumnos.value--
  }
}

async function guardarDatos() {
  if (!selectedGrupo.value) {
    alert('Selecciona un grupo primero')
    return
  }

  saveStatus.value = 'saving'

  try {
    const respuestas = []

    for (const row of gridData.value) {
      for (let p = 0; p < row.preguntas.length; p++) {
        const pregunta = row.preguntas[p]

        // Solo guardar si hay datos
        if (pregunta.base !== '' && pregunta.exp !== '') {
          respuestas.push({
            id_grupo: selectedGrupo.value,
            modelo: selectedModelo.value,
            alumno_idx: row.alumnoIdx,
            pregunta_num: p + 1,
            base_a: parseFloat(pregunta.base) || 0,
            exp_b: parseInt(pregunta.exp) || 0
          })
        }
      }
    }

    if (respuestas.length > 0) {
      await guardarRespuestasPapel(respuestas)
    }

    saveStatus.value = 'saved'
    setTimeout(() => { saveStatus.value = '' }, 3000)

  } catch (e) {
    console.error('Error guardando:', e)
    saveStatus.value = 'error'
  }
}

// ============================================
// EXPORTACIÓN CSV
// ============================================

async function exportarCSV(tabla) {
  try {
    const data = await exportarTabla(tabla)

    if (!data || data.length === 0) {
      alert(`La tabla "${tabla}" está vacía`)
      return
    }

    // Convertir a CSV
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h]
          // Escapar valores con comas o comillas
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`
          }
          if (typeof val === 'object') {
            return `"${JSON.stringify(val).replace(/"/g, '""')}"`
          }
          return val ?? ''
        }).join(',')
      )
    ]

    const csv = csvRows.join('\n')

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${tabla}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

  } catch (e) {
    console.error('Error exportando:', e)
    alert('Error al exportar. Revisa la consola.')
  }
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(async () => {
  // Auto-login en desarrollo
  if (import.meta.env.DEV) {
    isAuthenticated.value = true
  }

  if (isAuthenticated.value) {
    await cargarGrupos()
    initializeGrid()
  }
})

// Cuando se autentica, cargar datos
async function onAuthenticated() {
  await cargarGrupos()
  initializeGrid()
}
</script>

<template>
  <div class="min-h-screen p-8">
    <RouterLink to="/" class="inline-block mb-6 text-primary-500 hover:text-primary-600 transition-colors">
      ← Volver al inicio
    </RouterLink>

    <div v-if="!isAuthenticated" class="max-w-md mx-auto mt-12">
      <div class="card text-center">
        <div class="text-4xl mb-4">🔐</div>
        <h1 class="text-2xl font-bold text-neutral-800 mb-6">
          Panel de Administración
        </h1>

        <form @submit.prevent="handleLogin(); onAuthenticated()" class="space-y-4">
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

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-neutral-800">
            Panel de Administración
          </h1>
          <p class="text-neutral-500">
            Entrada de datos de exámenes en papel
          </p>
        </div>

        <RouterLink to="/" class="btn-ghost">
          ← Volver
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <!-- Sidebar: Configuración -->
        <div class="space-y-4">

          <!-- Selector de Grupo -->
          <div class="card">
            <h3 class="font-semibold text-neutral-700 mb-3">Grupo</h3>
            <select v-model="selectedGrupo" class="select" @change="initializeGrid">
              <option value="" disabled>Selecciona grupo</option>
              <option
                v-for="grupo in grupos"
                :key="grupo.id"
                :value="grupo.id"
              >
                {{ grupo.codigo_grupo }}
                <span v-if="grupo.centro">- {{ grupo.centro }}</span>
              </option>
            </select>

            <div v-if="grupoSeleccionado" class="mt-3 text-sm text-neutral-500">
              <p><strong>Centro:</strong> {{ grupoSeleccionado.centro || 'No indicado' }}</p>
              <p><strong>Alumnos previstos:</strong> {{ grupoSeleccionado.alumnos_previstos }}</p>
            </div>
          </div>

          <!-- Selector de Modelo -->
          <div class="card">
            <h3 class="font-semibold text-neutral-700 mb-3">Modelo</h3>
            <div class="flex gap-2">
              <button
                v-for="m in ['A', 'B', 'C', 'D']"
                :key="m"
                @click="selectedModelo = m"
                :class="[
                  'flex-1 py-2 rounded-xl font-mono font-bold transition-all',
                  selectedModelo === m
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                ]"
              >
                {{ m }}
              </button>
            </div>
          </div>

          <!-- Control de filas -->
          <div class="card">
            <h3 class="font-semibold text-neutral-700 mb-3">Alumnos</h3>
            <div class="flex items-center gap-3">
              <button
                @click="removeLastRow"
                class="btn-ghost px-3 py-2"
                :disabled="numAlumnos <= 1"
              >
                −
              </button>
              <span class="font-mono text-xl flex-1 text-center">
                {{ numAlumnos }}
              </span>
              <button @click="addRow" class="btn-ghost px-3 py-2">
                +
              </button>
            </div>
          </div>

          <!-- Acciones -->
          <div class="card space-y-3">
            <button
              @click="guardarDatos"
              class="btn-primary w-full"
              :disabled="!selectedGrupo || saveStatus === 'saving'"
            >
              <span v-if="saveStatus === 'saving'">Guardando...</span>
              <span v-else-if="saveStatus === 'saved'">✓ Guardado</span>
              <span v-else-if="saveStatus === 'error'">Error - Reintentar</span>
              <span v-else>Guardar Datos</span>
            </button>

            <button @click="initializeGrid" class="btn-outline w-full">
              Limpiar Grid
            </button>
          </div>

          <!-- Exportación -->
          <div class="card">
            <h3 class="font-semibold text-neutral-700 mb-3">Exportar CSV</h3>
            <div class="space-y-2">
              <button
                @click="exportarCSV('respuestas_online')"
                class="btn-ghost w-full text-sm justify-start"
              >
                📥 respuestas_online
              </button>
              <button
                @click="exportarCSV('respuestas_papel')"
                class="btn-ghost w-full text-sm justify-start"
              >
                📥 respuestas_papel
              </button>
              <button
                @click="exportarCSV('profesores')"
                class="btn-ghost w-full text-sm justify-start"
              >
                📥 profesores
              </button>
              <button
                @click="exportarCSV('log_descargas')"
                class="btn-ghost w-full text-sm justify-start"
              >
                📥 log_descargas
              </button>
            </div>
          </div>
        </div>

        <!-- Grid de entrada de datos -->
        <div class="lg:col-span-3">
          <div class="card overflow-x-auto">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="font-semibold text-neutral-700">
                Entrada de Datos - Modelo {{ selectedModelo }}
              </h3>
              <span class="text-sm text-neutral-400">
                Formato: base × 10^exponente
              </span>
            </div>

            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-neutral-200">
                  <th class="py-2 px-2 text-left font-medium text-neutral-600 w-16">
                    #
                  </th>
                  <th
                    v-for="p in NUM_PREGUNTAS"
                    :key="p"
                    class="py-2 px-1 text-center font-medium text-neutral-600"
                    colspan="2"
                  >
                    P{{ p }}
                  </th>
                </tr>
                <tr class="border-b border-neutral-100 text-xs text-neutral-400">
                  <th></th>
                  <template v-for="p in NUM_PREGUNTAS" :key="'header-' + p">
                    <th class="py-1 px-1">a</th>
                    <th class="py-1 px-1">b</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIdx) in gridData"
                  :key="row.alumnoIdx"
                  class="border-b border-neutral-50 hover:bg-neutral-50"
                >
                  <td class="py-2 px-2 font-mono text-neutral-500">
                    {{ row.alumnoIdx }}
                  </td>
                  <template v-for="(pregunta, pIdx) in row.preguntas" :key="pIdx">
                    <!-- Base (a) -->
                    <td class="py-1 px-1">
                      <input
                        v-model="pregunta.base"
                        type="text"
                        inputmode="decimal"
                        class="w-12 px-1 py-1 text-center font-mono text-sm border border-neutral-200 rounded focus:border-primary-500 focus:outline-none"
                        :tabindex="rowIdx * NUM_PREGUNTAS * 2 + pIdx * 2 + 1"
                        placeholder="a"
                      />
                    </td>
                    <!-- Exponente (b) -->
                    <td class="py-1 px-1">
                      <input
                        v-model="pregunta.exp"
                        type="text"
                        inputmode="numeric"
                        class="w-10 px-1 py-1 text-center font-mono text-sm border border-neutral-200 rounded focus:border-primary-500 focus:outline-none"
                        :tabindex="rowIdx * NUM_PREGUNTAS * 2 + pIdx * 2 + 2"
                        placeholder="b"
                      />
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>

            <div class="mt-4 text-xs text-neutral-400">
              <p>💡 Usa <kbd class="px-1 py-0.5 bg-neutral-100 rounded">Tab</kbd> para navegar entre campos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
