<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { registrarProfesor, registrarDescarga } from '@/lib/supabase'

// Estados del flujo
const step = ref('form') // 'form' | 'downloads'
const isLoading = ref(false)
const error = ref(null)

// Datos del formulario
const formData = ref({
  nombre: '',
  centro: '',
  numAlumnos: ''
})

// Datos del profesor registrado
const profesorData = ref(null)

// PDFs disponibles
const pdfs = [
  { id: 'ModeloA', nombre: 'Modelo A', icon: '📄' },
  { id: 'ModeloB', nombre: 'Modelo B', icon: '📄' },
  { id: 'ModeloC', nombre: 'Modelo C', icon: '📄' },
  { id: 'ModeloD', nombre: 'Modelo D', icon: '📄' },
  { id: 'Instrucciones', nombre: 'Instrucciones', icon: '📋' }
]

// Validación simple
const isFormValid = computed(() => {
  return formData.value.numAlumnos && parseInt(formData.value.numAlumnos) > 0
})

async function handleSubmit() {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = null

  try {
    const data = await registrarProfesor({
      nombre: formData.value.nombre || null,
      centro: formData.value.centro || null,
      alumnosPrevistos: parseInt(formData.value.numAlumnos)
    })

    profesorData.value = data
    step.value = 'downloads'
  } catch (e) {
    console.error('Error registrando profesor:', e)
    error.value = 'Hubo un error al registrar. Por favor, inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}

async function handleDownload(pdfId) {
  // Registrar la descarga en la base de datos
  try {
    if (profesorData.value?.id) {
      await registrarDescarga(profesorData.value.id, `${pdfId}.pdf`)
    }
  } catch (e) {
    console.error('Error registrando descarga:', e)
  }

  // TODO: Implementar descarga real desde Supabase Storage
  // Por ahora, simular descarga
  alert(`Descargando ${pdfId}.pdf... (Conectar con Supabase Storage)`)
}
</script>

<template>
  <div class="min-h-screen p-8">
    <RouterLink to="/" class="inline-block mb-6 text-primary-500 hover:text-primary-600 transition-colors">
      ← Volver al inicio
    </RouterLink>

    <div class="max-w-xl mx-auto">

      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-800">
          Sección Profesores
        </h1>
        <p class="text-neutral-600 mt-2">
          Descarga los materiales para aplicar el test en tu aula
        </p>
      </div>

      <!-- Formulario inicial -->
      <Transition name="fade" mode="out-in">
        <div v-if="step === 'form'" class="card">
          <form @submit.prevent="handleSubmit" class="space-y-6">

            <div>
              <label class="label">
                Nombre (opcional)
              </label>
              <input
                v-model="formData.nombre"
                type="text"
                class="input"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label class="label">
                Centro educativo (opcional)
              </label>
              <input
                v-model="formData.centro"
                type="text"
                class="input"
                placeholder="Nombre del centro"
              />
            </div>

            <div>
              <label class="label">
                Número estimado de alumnos *
              </label>
              <input
                v-model="formData.numAlumnos"
                type="number"
                min="1"
                class="input"
                placeholder="Ej: 25"
                required
              />
              <p class="text-xs text-neutral-500 mt-1">
                Aproximación del número de alumnos que realizarán el test
              </p>
            </div>

            <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
              {{ error }}
            </div>

            <button
              type="submit"
              class="btn-primary btn-large w-full"
              :disabled="!isFormValid || isLoading"
            >
              <span v-if="isLoading">Registrando...</span>
              <span v-else>Continuar a descargas</span>
            </button>
          </form>
        </div>

        <!-- Pantalla de descargas -->
        <div v-else-if="step === 'downloads'" class="space-y-6">

          <!-- Código de grupo prominente -->
          <div class="card-elevated text-center bg-primary-50 border-primary-200">
            <p class="text-sm text-primary-700 mb-2 font-medium">
              Tu Código de Grupo
            </p>
            <div class="text-5xl font-mono font-bold text-primary-600 tracking-widest mb-4">
              {{ profesorData?.codigo_grupo || 'XXXXXX' }}
            </div>
            <p class="text-sm text-primary-600">
              📝 Anota este código en la pizarra o en los folios de los alumnos
            </p>
          </div>

          <!-- Botones de descarga -->
          <div class="card">
            <h3 class="font-semibold text-neutral-700 mb-4">
              Materiales disponibles
            </h3>

            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="pdf in pdfs"
                :key="pdf.id"
                @click="handleDownload(pdf.id)"
                class="btn-outline flex items-center justify-center gap-2"
              >
                <span>{{ pdf.icon }}</span>
                <span>{{ pdf.nombre }}</span>
              </button>
            </div>
          </div>

          <!-- Instrucciones -->
          <div class="card bg-secondary-50 border-secondary-200">
            <h3 class="font-semibold text-secondary-700 mb-3">
              📋 Instrucciones rápidas
            </h3>
            <ol class="text-sm text-secondary-600 space-y-2 list-decimal list-inside">
              <li>Reparte los modelos A, B, C y D de forma equitativa entre los alumnos</li>
              <li>Asegúrate de que escriban el código de grupo en su folio</li>
              <li>Cada pregunta tiene un tiempo máximo de 3 minutos</li>
              <li>No hay respuestas correctas ni incorrectas</li>
            </ol>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
