<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getTestQuestions, getAvailableTests } from '@/lib/questions'
import ShareButton from '@/components/common/ShareButton.vue'

const props = defineProps({
  isLoading: { type: Boolean, default: false },
  error: { type: String, default: null }
})

const emit = defineEmits(['submit'])

const metadata = ref({
  edad: '40',
  codigoPersonal: '',
  email: '',
  piVsE: '',
  mismoTest: null,
  segundaVez: null,
  modelosYaHechos: []
})

const codigoGrupoInput = ref('')

watch(() => metadata.value.mismoTest, (val) => {
  if (!val) codigoGrupoInput.value = ''
})

const edadOptions = Array.from({ length: 96 }, (_, i) => i + 4)

const piVsEOptions = [
  { value: 'pi', label: 'π (pi)' },
  { value: 'e', label: 'e (Euler)' },
  { value: 'no_se', label: 'No lo sé / No lo recuerdo' }
]

const modeloOptions = ref(['A', 'B', 'C', 'D'])
const primerasPreguntasPorModelo = ref({})

onMounted(async () => {
  const tests = await getAvailableTests()
  modeloOptions.value = tests
  for (const testNum of tests) {
    const questions = await getTestQuestions(testNum)
    if (questions.length > 0) {
      primerasPreguntasPorModelo.value[testNum] = questions[0].texto
    }
  }
})

function toggleModeloYaHecho(modelo) {
  const index = metadata.value.modelosYaHechos.indexOf(modelo)
  if (index > -1) {
    metadata.value.modelosYaHechos.splice(index, 1)
  } else {
    metadata.value.modelosYaHechos.push(modelo)
  }
}

const isValid = computed(() => {
  const m = metadata.value
  if (!m.edad || !m.piVsE) return false
  if (m.mismoTest === null) return false
  if (m.mismoTest === true) return modeloOptions.value.includes(codigoGrupoInput.value)
  if (m.segundaVez === null) return false
  if (m.segundaVez === true) return m.modelosYaHechos.length > 0
  return true
})

function handleSubmit() {
  if (!isValid.value) return
  emit('submit', { metadata: metadata.value, codigoGrupo: codigoGrupoInput.value })
}
</script>

<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-neutral-800">¡Juguemos a Estimar! 🎯</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">

      <div class="card">
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-1">
            <label class="label">Edad</label>
            <select v-model="metadata.edad" class="select" required>
              <option value="" disabled>—</option>
              <option v-for="edad in edadOptions" :key="edad" :value="edad">{{ edad }}</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="label">Alias <span class="font-normal text-neutral-400">(opcional)</span></label>
            <input v-model="metadata.codigoPersonal" type="text" class="input" placeholder="Einstein42" maxlength="20" />
            <p class="text-sm text-neutral-400 mt-1.5 italic">Para encontrarte más tarde entre los resultados.</p>
          </div>
          <div class="col-start-2 col-span-2">
            <label class="label">Email <span class="font-normal text-neutral-400">(opcional)</span></label>
            <input v-model="metadata.email" type="text" class="input" placeholder="tu@email.com" maxlength="100" />
            <p class="text-sm text-neutral-400 mt-1.5 italic">Cuando publique los resultados del estudio, te aviso.</p>
          </div>
        </div>
      </div>

      <div class="card space-y-3">
        <label class="label !mb-0">¿Qué número es más grande?</label>
        <div class="flex flex-wrap gap-2">
          <label v-for="option in piVsEOptions" :key="option.value" class="flex-1 min-w-[100px] cursor-pointer">
            <input type="radio" v-model="metadata.piVsE" :value="option.value" class="sr-only peer" required />
            <div class="text-center py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 border-neutral-200 text-neutral-600 hover:border-neutral-300 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700">
              {{ option.label }}
            </div>
          </label>
        </div>
        <p class="text-sm text-neutral-400 italic">Esta pregunta me ayuda a calibrar tu familiaridad con las matemáticas.</p>
      </div>

      <div class="card space-y-4">
        <div class="flex gap-2">
          <label v-for="opt in [{ value: false, label: 'Estoy sol@' }, { value: true, label: 'Estoy acompañad@' }]" :key="String(opt.value)" class="flex-1 cursor-pointer">
            <input type="radio" v-model="metadata.mismoTest" :value="opt.value" class="sr-only peer" />
            <div class="text-center py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 border-neutral-200 text-neutral-600 hover:border-neutral-300 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700">
              {{ opt.label }}
            </div>
          </label>
        </div>

        <Transition name="fade">
          <div v-if="metadata.mismoTest === false" class="space-y-3">
            <p class="text-sm font-medium text-neutral-700">¿Ya hiciste el test antes?</p>
            <div class="flex gap-2">
              <label v-for="opt in [{ value: true, label: 'Sí' }, { value: false, label: 'No' }]" :key="String(opt.value)" class="flex-1 cursor-pointer">
                <input type="radio" v-model="metadata.segundaVez" :value="opt.value" class="sr-only peer" />
                <div class="text-center py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 border-neutral-200 text-neutral-600 hover:border-neutral-300 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700">
                  {{ opt.label }}
                </div>
              </label>
            </div>
            <p class="text-sm text-neutral-500 italic">Hay 4 modelos. Puedes jugar más veces.</p>
            <Transition name="fade">
              <div v-if="metadata.segundaVez === true" class="space-y-2">
                <label class="label">Marca cuáles hiciste ya:</label>
                <div class="space-y-2">
                  <label
                    v-for="modelo in modeloOptions"
                    :key="modelo"
                    class="flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer hover:bg-neutral-50"
                    :class="metadata.modelosYaHechos.includes(modelo) ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'"
                  >
                    <input type="checkbox" :checked="metadata.modelosYaHechos.includes(modelo)" @change="toggleModeloYaHecho(modelo)" class="w-5 h-5 rounded text-primary-500 mt-0.5" />
                    <span class="flex-1">
                      <span class="font-mono font-bold text-neutral-800 block">Modelo {{ modelo }}</span>
                      <span class="text-xs text-neutral-500 mt-1 italic block">La P1 decía: "{{ primerasPreguntasPorModelo[modelo] }}"</span>
                    </span>
                  </label>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="metadata.mismoTest === true" class="space-y-3">
            <p class="text-sm text-neutral-500">Cada uno hará el test por su cuenta.</p>
            <p class="text-sm text-neutral-500">Que cada uno acceda al test en su dispositivo.</p>
            <ShareButton class="w-full !justify-center btn-outline" />
            <p class="text-sm text-neutral-500">Simplemente, elegid todos la misma letra para aseguraros de hacer el mismo test.</p>
            <div class="flex gap-2">
              <label v-for="m in modeloOptions" :key="m" class="cursor-pointer">
                <input type="radio" v-model="codigoGrupoInput" :value="m" class="sr-only peer" />
                <div class="w-12 text-center py-2 rounded-xl text-sm font-bold border-2 transition-all duration-150 border-neutral-200 text-neutral-600 hover:border-neutral-300 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700">
                  {{ m }}
                </div>
              </label>
            </div>
          </div>
        </Transition>
      </div>

      <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-xl text-sm">{{ error }}</div>

      <button type="submit" class="btn-primary btn-large w-full" :disabled="!isValid || isLoading">
        <span v-if="isLoading">Cargando...</span>
        <span v-else>Vamos →</span>
      </button>
    </form>
  </div>
</template>
