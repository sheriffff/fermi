<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { uploadScribble } from '@/lib/supabase'

const props = defineProps({
  userId: { type: String, required: true }
})

const emit = defineEmits(['done', 'skip'])

const MAX_PHOTOS = 3
const photos = ref([])
const uploading = ref(false)
const error = ref(null)
const qrDataUrl = ref(null)

const isMobile = /mobi|android|iphone|ipod|phone|tablet|ipad/i.test(navigator.userAgent)

onMounted(async () => {
  if (!isMobile) {
    try {
      const uploadUrl = `${window.location.origin}/upload/${props.userId}`
      qrDataUrl.value = await QRCode.toDataURL(uploadUrl, { width: 200, margin: 2 })
    } catch (e) {
      console.error('Error generando QR:', e)
    }
  }
})

function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          const name = file.name.replace(/\.[^.]+$/, '.jpg')
          resolve(new File([blob], name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

function handleFileInput(event) {
  const files = event.target.files
  if (!files.length) return

  for (const file of files) {
    if (photos.value.length >= MAX_PHOTOS) break
    if (!file.type.startsWith('image/')) continue
    const url = URL.createObjectURL(file)
    photos.value.push({ file, url })
  }
  event.target.value = ''
}

function removePhoto(index) {
  URL.revokeObjectURL(photos.value[index].url)
  photos.value.splice(index, 1)
}

async function submit() {
  if (!photos.value.length) return
  uploading.value = true
  error.value = null

  try {
    for (const photo of photos.value) {
      const compressed = await compressImage(photo.file)
      await uploadScribble(props.userId, compressed)
    }
    emit('done')
  } catch (e) {
    console.error('Error subiendo foto:', e)
    error.value = 'Error al subir las fotos. Inténtalo de nuevo.'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="text-center">
    <div class="card-elevated py-10">
      <div class="text-5xl mb-4">📸</div>

      <h2 class="text-2xl font-bold text-neutral-800 mb-2">
        ¿Puedes hacernos una foto de tus cálculos?
      </h2>
      <p class="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
        Si has usado papel para hacer cuentas, una foto nos ayuda mucho en la investigación.
      </p>

      <div v-if="qrDataUrl && !photos.length" class="mb-6">
        <p class="text-sm text-neutral-500 mb-3">Escanea con tu móvil para sacar una foto:</p>
        <img :src="qrDataUrl" alt="QR" class="mx-auto w-48 h-48 rounded-xl" />
        <div class="flex items-center gap-3 my-5 max-w-xs mx-auto">
          <div class="flex-1 h-px bg-neutral-200"></div>
          <span class="text-xs text-neutral-400">o sube desde aquí</span>
          <div class="flex-1 h-px bg-neutral-200"></div>
        </div>
      </div>

      <div v-if="photos.length < MAX_PHOTOS" class="mb-6 max-w-xs mx-auto">
        <label class="block w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl text-center cursor-pointer hover:border-primary-500 transition-colors">
          <span class="text-neutral-600 text-lg">📷 {{ isMobile ? 'Hacer foto' : 'Subir imagen' }}</span>
          <input
            type="file"
            accept="image/*"
            :capture="isMobile ? 'environment' : undefined"
            class="hidden"
            @change="handleFileInput"
          />
        </label>
      </div>

      <div v-if="photos.length" class="grid grid-cols-3 gap-3 mb-6 max-w-xs mx-auto">
        <div v-for="(photo, i) in photos" :key="i" class="relative">
          <img :src="photo.url" class="w-full aspect-square object-cover rounded-lg" />
          <button
            @click="removePhoto(i)"
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
          >✕</button>
        </div>
      </div>

      <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-4 max-w-xs mx-auto">
        {{ error }}
      </div>

      <div class="flex flex-col items-center gap-3 max-w-xs mx-auto">
        <button
          v-if="photos.length"
          @click="submit"
          :disabled="uploading"
          class="btn-primary btn-large w-full"
        >
          <span v-if="uploading">Subiendo...</span>
          <span v-else>Enviar {{ photos.length }} foto{{ photos.length > 1 ? 's' : '' }}</span>
        </button>
        <button
          @click="$emit('skip')"
          :disabled="uploading"
          class="text-neutral-400 hover:text-neutral-600 text-sm transition-colors"
        >
          Saltar, no tengo papel
        </button>
      </div>
    </div>
  </div>
</template>
