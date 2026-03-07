<script setup>
defineProps({ show: Boolean })
defineEmits(['close'])

const activities = [
  {
    emoji: '🍝',
    title: 'El misterio del espagueti',
    question: '¿Cuántos espaguetis hay en un paquete?',
    hint: 'Cuéntad 10, pesadlos... y extrapolad al total.',
    level: 'Fácil',
  },
  {
    emoji: '👣',
    title: 'Pasos hasta el Sol',
    question: '¿Cuántos pasos necesitarías para llegar al Sol?',
    hint: 'Mide tu zancada, busca la distancia Tierra-Sol. Calculad juntos.',
    level: 'Difícil',
  },
  {
    emoji: '🍚',
    title: 'El vaso de arroz',
    question: '¿Cuántos granos de arroz caben en un vaso?',
    hint: 'Contad 50 granos, pesadlos. Luego pesad el vaso lleno.',
    level: 'Fácil',
  },
  {
    emoji: '💓',
    title: 'Tu corazón de noche',
    question: '¿Cuántas veces late tu corazón mientras duermes?',
    hint: 'Tomad el pulso en 15s, multiplicad por 4 y por las horas durmiendo.',
    level: 'Medio',
  },
  {
    emoji: '📚',
    title: 'Palabras en tu libro',
    question: '¿Cuántas palabras tiene tu libro favorito?',
    hint: 'Contad palabras en una línea, líneas en una página, páginas en el libro.',
    level: 'Fácil',
  },
  {
    emoji: '⏳',
    title: 'Segundos de vida',
    question: '¿Cuántos segundos llevas vivo?',
    hint: 'Edad × 365 × 24 × 3600. ¿Cuándo llegaréis al millón? ¿Al billón?',
    level: 'Fácil',
  },
  {
    emoji: '🚗',
    title: 'El detector de tráfico',
    question: '¿Cuántos coches pasan por vuestra calle cada día?',
    hint: 'Contad en 5 minutos desde la ventana. Extrapolad.',
    level: 'Fácil',
  },
  {
    emoji: '💇',
    title: 'Los pelos de tu cabeza',
    question: '¿Cuántos pelos tienes en la cabeza?',
    hint: 'Contad pelos en 1 cm², medid el área de la cabeza con un gorro de ducha.',
    level: 'Difícil',
  },
  {
    emoji: '🛁',
    title: 'Llenar la bañera',
    question: '¿Cuántos vasos de agua caben en la bañera?',
    hint: 'Medid el vaso, estimad las dimensiones de la bañera. Sin agua.',
    level: 'Medio',
  },
  {
    emoji: '🍕',
    title: 'Pizzas de por vida',
    question: '¿Cuántas pizzas habéis comido en vuestra vida?',
    hint: 'Cuántas por mes × 12 × edad. ¿Cuánto mide la fila si las ponéis en línea?',
    level: 'Fácil',
  },
  {
    emoji: '🌧️',
    title: 'La lluvia de tu ciudad',
    question: '¿Cuántos litros de agua caen en tu ciudad en un día de lluvia?',
    hint: 'Buscad los mm de lluvia, multiplicad por el área de la ciudad en m².',
    level: 'Difícil',
  },
  {
    emoji: '🐾',
    title: 'Pasos al cole',
    question: '¿Cuántos pasos das al año yendo y volviendo del cole?',
    hint: 'Contad pasos un día, multiplicad por días lectivos × 2.',
    level: 'Fácil',
  },
]

const levelColor = {
  'Fácil': 'bg-emerald-100 text-emerald-700',
  'Medio': 'bg-amber-100 text-amber-700',
  'Difícil': 'bg-rose-100 text-rose-700',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
          <div class="p-6 pb-4 border-b border-neutral-100 flex-shrink-0">
            <button
              @click="$emit('close')"
              class="absolute top-3 right-3 bg-neutral-100 rounded-full p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 class="text-2xl font-bold text-neutral-800 mb-1">Para jugar en familia 👨‍👩‍👧</h2>
            <p class="text-neutral-500 text-sm leading-relaxed">
              Los problemas de Fermi son perfectos para el día a día. No hacen falta calculadoras, solo curiosidad y ganas de razonar juntos. El proceso importa más que la respuesta exacta.
            </p>
          </div>

          <div class="overflow-y-auto flex-1 p-6 pt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="a in activities"
                :key="a.title"
                class="bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
              >
                <div class="flex items-start gap-3">
                  <span class="text-2xl flex-shrink-0 mt-0.5">{{ a.emoji }}</span>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 class="font-semibold text-neutral-800 text-sm">{{ a.title }}</h3>
                      <span :class="levelColor[a.level]" class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        {{ a.level }}
                      </span>
                    </div>
                    <p class="text-neutral-700 text-sm mb-1.5 italic">{{ a.question }}</p>
                    <p class="text-neutral-400 text-xs leading-relaxed">💡 {{ a.hint }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Consejo:</strong> No busquéis la respuesta correcta de entrada. Primero estimad, luego comparad con el real. La diferencia es el aprendizaje.
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
