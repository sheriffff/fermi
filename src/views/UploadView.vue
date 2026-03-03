<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { uploadScribble } from '@/lib/supabase'

const route = useRoute()
const userId = route.params.userId

const MAX_PHOTOS = 3
const photos = ref([])
const uploading = ref(false)
const done = ref(false)
const error = ref(null)

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
      await uploadScribble(userId, compressed)
    }
    done.value = true
  } catch (e) {
    console.error('Error subiendo foto:', e)
    error.value = 'Error al subir las fotos. Inténtalo de nuevo.'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen p-6 flex items-start justify-center">
    <div class="w-full max-w-sm">

      <div v-if="done" class="text-center py-12">
        <div class="text-5xl mb-4">✅</div>
        <h1 class="text-2xl font-bold text-neutral-800 mb-2">¡Fotos enviadas!</h1>
        <p class="text-neutral-600">Gracias. Ya puedes cerrar esta página.</p>
      </div>

      <div v-else>
        <h1 class="text-2xl font-bold text-neutral-800 mb-2 text-center">
          Sube fotos de tus garabatos
        </h1>
        <p class="text-neutral-500 text-sm text-center mb-6">
          Puedes subir hasta {{ MAX_PHOTOS }} fotos
        </p>

        <div v-if="photos.length < MAX_PHOTOS" class="mb-6">
          <label class="block w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl text-center cursor-pointer hover:border-primary-500 transition-colors">
            <span class="text-neutral-600 text-lg">📷 Sacar foto</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="handleFileInput"
            />
          </label>
        </div>

        <div v-if="photos.length" class="grid grid-cols-3 gap-3 mb-6">
          <div v-for="(photo, i) in photos" :key="i" class="relative">
            <img :src="photo.url" class="w-full aspect-square object-cover rounded-lg" />
            <button
              @click="removePhoto(i)"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
            >✕</button>
          </div>
        </div>

        <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-xl text-sm mb-4">
          {{ error }}
        </div>

        <button
          v-if="photos.length"
          @click="submit"
          :disabled="uploading"
          class="btn-primary btn-large w-full"
        >
          <span v-if="uploading">Subiendo...</span>
          <span v-else>Enviar {{ photos.length }} foto{{ photos.length > 1 ? 's' : '' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
