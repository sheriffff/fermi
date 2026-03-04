<script setup>
import { ref } from 'vue'
import FermiInput from '@/components/common/FermiInput.vue'
import MobileKeypad from '@/components/common/MobileKeypad.vue'
import { useMobile } from '@/composables/useMobile'

const props = defineProps({
  questionText: { type: String, required: true },
  unitText: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  submitLabel: { type: String, default: 'Enviar' },
  submitDisabled: { type: Boolean, default: true },
  isLastQuestion: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:modelValue'])

const { isMobile } = useMobile()
const fermiInputRef = ref(null)

function focusInput() {
  if (isMobile.value) return
  fermiInputRef.value?.inputRef?.focus()
}

defineExpose({ fermiInputRef, focusInput })
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-xl font-medium text-neutral-800 leading-relaxed">
        {{ questionText }}
      </h2>
      <p v-if="unitText" class="text-sm text-neutral-400 mt-2">
        Responde en: {{ unitText }}
      </p>
    </div>

    <FermiInput
      ref="fermiInputRef"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      @submit="!submitDisabled && emit('submit')"
      :suppress-keyboard="isMobile"
      :hide-buttons="isMobile"
    />

    <div v-if="!isMobile" class="mt-8">
      <button
        @click="emit('submit')"
        class="btn-primary btn-large w-full"
        :disabled="submitDisabled"
      >
        {{ submitLabel }}
      </button>
    </div>

    <Teleport to="body">
      <MobileKeypad
        v-if="isMobile"
        :fermi-input="fermiInputRef"
        :submit-disabled="submitDisabled"
        :is-last-question="isLastQuestion"
        @submit="emit('submit')"
      />
    </Teleport>
  </div>
</template>
