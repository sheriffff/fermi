<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { createUserPaper, saveResponsesPaper, exportTable } from '@/lib/supabase'

const isAuthenticated = ref(false)
const passwordInput = ref('')
const authError = ref(false)

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

async function handleLogin() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    isAuthenticated.value = true
    authError.value = false
  } else {
    authError.value = true
  }
}

const selectedModelo = ref('A')
const isLoading = ref(false)
const saveStatus = ref('')

const NUM_PREGUNTAS = 8
const NUM_ALUMNOS = 10
const gridData = ref([])

const sharedMeta = ref({
  timeOfDay: '',
  schoolType: ''
})

const setAllAge = ref('14')

function setAllAges() {
  for (const row of gridData.value) {
    row.meta.age = setAllAge.value
  }
}

function initializeGrid() {
  gridData.value = []
  for (let i = 0; i < NUM_ALUMNOS; i++) {
    gridData.value.push({
      meta: {
        age: '14',
        sex: 'masculino',
        favoriteSubject: 'educacion_fisica',
        mathMarkLastPeriod: '7',
        isPhysicsChemistryStudent: false,
        mood: 'bien'
      },
      preguntas: Array.from({ length: NUM_PREGUNTAS }, () => ({ base: '', exp: '' }))
    })
  }
}

const validationError = ref('')

function validateGrid() {
  for (let i = 0; i < gridData.value.length; i++) {
    const row = gridData.value[i]
    const hasAnyAnswer = row.preguntas.some(p => p.base !== '' || p.exp !== '')
    if (!hasAnyAnswer) continue
    for (let j = 0; j < row.preguntas.length; j++) {
      const p = row.preguntas[j]
      const hasBase = p.base !== ''
      const hasExp = p.exp !== ''
      if (hasBase !== hasExp) {
        return `Fila ${i + 1}, P${j + 1}: falta ${hasBase ? 'b' : 'a'}`
      }
      if (hasBase && isNaN(Number(p.base))) {
        return `Fila ${i + 1}, P${j + 1}: a no es número válido`
      }
      if (hasExp && (!Number.isInteger(Number(p.exp)) || p.exp.trim() === '')) {
        return `Fila ${i + 1}, P${j + 1}: b no es entero válido`
      }
    }
  }
  return ''
}

async function saveData() {
  const error = validateGrid()
  if (error) {
    validationError.value = error
    setTimeout(() => { validationError.value = '' }, 4000)
    return
  }

  saveStatus.value = 'saving'

  try {
    for (const row of gridData.value) {
      const hasAnswers = row.preguntas.some(p => p.base !== '' && p.exp !== '')
      if (!hasAnswers || !row.meta.age) continue

      const userId = await createUserPaper({
        age: parseInt(row.meta.age),
        sex: row.meta.sex || 'prefiero_no_decir',
        timeOfDay: sharedMeta.value.timeOfDay || null,
        favoriteSubject: row.meta.favoriteSubject || null,
        mathMarkLastPeriod: row.meta.mathMarkLastPeriod ? parseFloat(row.meta.mathMarkLastPeriod) : null,
        isPhysicsChemistryStudent: row.meta.isPhysicsChemistryStudent,
        schoolType: sharedMeta.value.schoolType || null,
        mood: row.meta.mood || null,
        testModel: selectedModelo.value
      })

      const respuestas = row.preguntas
        .map((p, idx) => ({
          questionN: idx + 1,
          baseA: parseFloat(p.base),
          expB: parseInt(p.exp)
        }))
        .filter(r => !isNaN(r.baseA) && !isNaN(r.expB))

      if (respuestas.length > 0) {
        await saveResponsesPaper(userId, selectedModelo.value, respuestas)
      }
    }

    saveStatus.value = 'saved'
    setTimeout(() => { saveStatus.value = '' }, 3000)
  } catch (e) {
    console.error('Error guardando:', e)
    saveStatus.value = 'error'
  }
}

async function exportCSV(tabla) {
  try {
    const data = await exportTable(tabla)

    if (!data || data.length === 0) {
      alert(`La tabla "${tabla}" está vacía`)
      return
    }

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h]
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

onMounted(() => {
  initializeGrid()
})
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
          <p class="text-neutral-500">
            Entrada de datos de exámenes en papel
          </p>
        </div>

        <RouterLink to="/" class="btn-ghost">
          ← Volver
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <!-- Sidebar -->
        <div class="space-y-4">

          <!-- Shared metadata -->
          <div class="card space-y-3">
            <h3 class="font-semibold text-neutral-700">Datos comunes</h3>
            <div>
              <label class="label">Tipo de centro</label>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="t in [{val: 'publico', label: 'Público'}, {val: 'privado', label: 'Privado'}, {val: 'concertado', label: 'Concertado'}]"
                  :key="t.val"
                  @click="sharedMeta.schoolType = sharedMeta.schoolType === t.val ? '' : t.val"
                  :class="[
                    'px-2 py-1 text-xs rounded-lg font-medium transition-all',
                    sharedMeta.schoolType === t.val
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  ]"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="label">Hora del día</label>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="h in [8,9,10,11,12,13,14,15,16,17]"
                  :key="h"
                  @click="sharedMeta.timeOfDay = sharedMeta.timeOfDay === String(h) ? '' : String(h)"
                  :class="[
                    'px-2 py-1 text-xs rounded-lg font-medium transition-all',
                    sharedMeta.timeOfDay === String(h)
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  ]"
                >
                  {{ h }}h
                </button>
              </div>
            </div>
          </div>

          <!-- Model selector -->
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

          <!-- Set all ages -->
          <div class="card">
            <h3 class="font-semibold text-neutral-700 mb-3">Edad de todos</h3>
            <div class="flex gap-2">
              <select v-model="setAllAge" class="select flex-1">
                <option v-for="a in [10,11,12,13,14,15,16,17,18,19,20]" :key="a" :value="String(a)">{{ a }}</option>
              </select>
              <button @click="setAllAges" class="btn-primary">Aplicar</button>
            </div>
          </div>

          <!-- Export -->
          <div class="card">
            <h3 class="font-semibold text-neutral-700 mb-3">Exportar CSV</h3>
            <div class="space-y-1">
              <p class="text-xs font-medium text-neutral-400 uppercase">Tablas</p>
              <button @click="exportCSV('users_online')" class="btn-ghost w-full text-sm !justify-start">📥 users_online</button>
              <button @click="exportCSV('responses_online')" class="btn-ghost w-full text-sm !justify-start">📥 responses_online</button>
              <button @click="exportCSV('users_paper')" class="btn-ghost w-full text-sm !justify-start">📥 users_paper</button>
              <button @click="exportCSV('responses_paper')" class="btn-ghost w-full text-sm !justify-start">📥 responses_paper</button>
              <button @click="exportCSV('logs_download')" class="btn-ghost w-full text-sm !justify-start">📥 logs_download</button>
              <p class="text-xs font-medium text-neutral-400 uppercase pt-2">Vistas joineadas</p>
              <button @click="exportCSV('view_responses_online')" class="btn-ghost w-full text-sm !justify-start whitespace-nowrap">📥 view_resp_online</button>
              <button @click="exportCSV('view_responses_paper')" class="btn-ghost w-full text-sm !justify-start whitespace-nowrap">📥 view_resp_paper</button>
            </div>
          </div>
        </div>

        <!-- Grid -->
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
                  <th class="py-2 px-2 text-left font-medium text-neutral-600 w-8">#</th>
                  <th class="py-2 px-2 text-center font-medium text-neutral-600 w-16">Edad</th>
                  <th class="py-2 px-2 text-center font-medium text-neutral-600 w-16">Sexo</th>
                  <th class="py-2 px-2 text-center font-medium text-neutral-600 w-20">Asig. fav.</th>
                  <th class="py-2 px-2 text-center font-medium text-neutral-600 w-16">Nota mat.</th>
                  <th class="py-2 px-2 text-center font-medium text-neutral-600 w-12">FyQ</th>
                  <th class="py-2 px-2 text-center font-medium text-neutral-600 w-16">Ánimo</th>
                  <th
                    v-for="p in NUM_PREGUNTAS"
                    :key="p"
                    class="py-2 text-center font-medium text-neutral-600"
                    :class="p > 1 ? 'pl-3' : 'pl-1'"
                    colspan="2"
                  >
                    P{{ p }}
                  </th>
                </tr>
                <tr class="border-b border-neutral-100 text-xs text-neutral-400">
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <template v-for="p in NUM_PREGUNTAS" :key="'header-' + p">
                    <th class="py-1" :class="p > 1 ? 'pl-3' : 'pl-1'">a</th>
                    <th class="py-1 px-1">b</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIdx) in gridData"
                  :key="rowIdx"
                  class="border-b border-neutral-50 hover:bg-neutral-50"
                >
                  <td class="py-1 px-2 font-mono text-neutral-400 text-sm">
                    {{ rowIdx + 1 }}
                  </td>
                  <td class="py-1 px-1">
                    <select
                      v-model="row.meta.age"
                      class="w-14 px-0.5 py-1 text-xs border border-neutral-200 rounded focus:border-primary-500 focus:outline-none"
                    >
                      <option v-for="a in [10,11,12,13,14,15,16,17,18,19,20]" :key="a" :value="String(a)">{{ a }}</option>
                    </select>
                  </td>
                  <td class="py-1 px-1">
                    <select v-model="row.meta.sex" class="w-14 px-0.5 py-1 text-xs border border-neutral-200 rounded focus:border-primary-500 focus:outline-none">
                      <option value="">-</option>
                      <option value="masculino">M</option>
                      <option value="femenino">F</option>
                      <option value="otro">O</option>
                    </select>
                  </td>
                  <td class="py-1 px-1">
                    <select v-model="row.meta.favoriteSubject" class="w-20 px-0.5 py-1 text-xs border border-neutral-200 rounded focus:border-primary-500 focus:outline-none">
                      <option value="">-</option>
                      <option value="educacion_fisica">EF</option>
                      <option value="matematicas">Mates</option>
                      <option value="fisica_quimica">FyQ</option>
                      <option value="tecnologia">Tecno</option>
                      <option value="economia">Economía</option>
                      <option value="biologia_geologia">BioGeo</option>
                      <option value="lengua">Lengua</option>
                      <option value="filosofia">Filo</option>
                      <option value="historia">Historia</option>
                      <option value="ingles">Inglés</option>
                      <option value="musica">Música</option>
                      <option value="plastica">Plástica</option>
                      <option value="otra">Otra</option>
                    </select>
                  </td>
                  <td class="py-1 px-1">
                    <select v-model="row.meta.mathMarkLastPeriod" class="w-14 px-0.5 py-1 text-xs border border-neutral-200 rounded focus:border-primary-500 focus:outline-none">
                      <option v-for="n in [1,2,3,4,5,6,7,8,9,10]" :key="n" :value="String(n)">{{ n }}</option>
                    </select>
                  </td>
                  <td class="py-1 px-1 text-center">
                    <input
                      v-model="row.meta.isPhysicsChemistryStudent"
                      type="checkbox"
                      class="w-4 h-4 rounded text-primary-500"
                    />
                  </td>
                  <td class="py-1 px-1">
                    <select v-model="row.meta.mood" class="w-16 px-0.5 py-1 text-xs border border-neutral-200 rounded focus:border-primary-500 focus:outline-none">
                      <option value="">-</option>
                      <option value="mal">Mal</option>
                      <option value="regular">Reg</option>
                      <option value="bien">Bien</option>
                      <option value="muy_bien">M.bien</option>
                    </select>
                  </td>
                  <template v-for="(pregunta, pIdx) in row.preguntas" :key="pIdx">
                    <td class="py-1" :class="pIdx > 0 ? 'pl-3' : 'pl-1'">
                      <input
                        v-model="pregunta.base"
                        type="text"
                        inputmode="decimal"
                        class="w-12 px-1 py-1 text-center font-mono text-sm border border-neutral-200 rounded focus:border-primary-500 focus:outline-none"
                        placeholder="a"
                      />
                    </td>
                    <td class="py-1 px-1">
                      <input
                        v-model="pregunta.exp"
                        type="text"
                        inputmode="numeric"
                        class="w-10 px-1 py-1 text-center font-mono text-sm border border-neutral-200 rounded focus:border-primary-500 focus:outline-none"
                        placeholder="b"
                      />
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>

            <div class="mt-4 flex items-center gap-3">
              <button
                @click="saveData"
                class="btn-primary"
                :disabled="saveStatus === 'saving'"
              >
                <span v-if="saveStatus === 'saving'">Guardando...</span>
                <span v-else-if="saveStatus === 'saved'">✓ Guardado</span>
                <span v-else-if="saveStatus === 'error'">Error - Reintentar</span>
                <span v-else>Guardar Datos</span>
              </button>

              <button @click="initializeGrid" class="btn-outline">
                Limpiar Grid
              </button>

              <span v-if="validationError" class="text-sm text-red-500 font-medium animate-pulse">
                {{ validationError }}
              </span>

              <span class="text-xs text-neutral-400 ml-auto">
                💡 Usa <kbd class="px-1 py-0.5 bg-neutral-100 rounded">Tab</kbd> para navegar entre campos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
