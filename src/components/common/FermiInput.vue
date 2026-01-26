<script setup>
import { computed, ref } from 'vue'
import { useNumberFormat } from '@/composables/useNumberFormat'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const { formatNumber, cleanInput } = useNumberFormat()

const inputRef = ref(null)

function handleKeydown(event) {
  // Permitir: backspace, delete, tab, escape, enter, arrows
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

  // Permitir Ctrl/Cmd + A, C, V, X (select all, copy, paste, cut)
  if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
    return
  }

  // Si es una tecla permitida, dejarla pasar
  if (allowedKeys.includes(event.key)) {
    return
  }

  // Solo permitir números (0-9)
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault()
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pastedText = event.clipboardData.getData('text')
  const cleaned = pastedText.replace(/\D/g, '').slice(0, 21)
  if (cleaned) {
    emit('update:modelValue', cleaned)
  }
}

function handleInput(event) {
  const value = event.target.value
  const cleaned = value.replace(/\D/g, '')
  const limited = cleaned.slice(0, 21)
  emit('update:modelValue', limited)
}

function multiplyByThousand() {
  if (props.disabled) return
  const cleaned = cleanInput(props.modelValue)
  if (!cleaned) return

  const value = BigInt(cleaned)
  const result = value * 1000n
  const resultStr = result.toString()

  if (result > 1000000000000000000n) return

  if (resultStr.length <= 21) {
    emit('update:modelValue', resultStr)
  }
}

function divideByThousand() {
  if (props.disabled) return
  const cleaned = cleanInput(props.modelValue)
  if (!cleaned) return

  const value = BigInt(cleaned)
  if (value < 1000n) return

  const result = value / 1000n
  emit('update:modelValue', result.toString())
}

const formattedAnswer = computed(() => {
  const cleaned = cleanInput(props.modelValue)
  if (!cleaned) return '—'
  return formatNumber(parseInt(cleaned, 10))
})

const canMultiply = computed(() => {
  const cleaned = cleanInput(props.modelValue)
  if (!cleaned) return false

  try {
    const value = BigInt(cleaned)
    const result = value * 1000n
    return result <= 1000000000000000000n && result.toString().length <= 21
  } catch {
    return false
  }
})

const canDivide = computed(() => {
  const cleaned = cleanInput(props.modelValue)
  if (!cleaned) return false

  try {
    const value = BigInt(cleaned)
    return value >= 1000n
  } catch {
    return false
  }
})

defineExpose({
  inputRef
})
</script>

<template>
  <div class="fermi-input" :class="{ 'fermi-input--disabled': disabled }">
    <div class="fermi-layout">

      <div class="fermi-center">
        <input
          ref="inputRef"
          :value="modelValue"
          @input="handleInput"
          @keydown="handleKeydown"
          @paste="handlePaste"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="input-large"
          placeholder="Escribe tu estimación"
          autocomplete="off"
          :disabled="disabled"
          maxlength="21"
        />

        <div class="text-center">
          <span class="number-display">
            {{ formattedAnswer }}
          </span>
        </div>
      </div>

      <div class="fermi-buttons">
        <button
          @click="multiplyByThousand"
          :disabled="disabled || !canMultiply"
          class="multiply-btn"
        >
          ×1000
        </button>
        <button
          @click="divideByThousand"
          :disabled="disabled || !canDivide"
          class="divide-btn"
        >
          ÷1000
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@reference "../../assets/main.css";

.fermi-input {
  @apply w-full;
}

.fermi-input--disabled {
  @apply opacity-60 pointer-events-none;
}

.fermi-layout {
  @apply flex items-start gap-3;
}

.fermi-center {
  @apply flex-1 space-y-4;
}

.fermi-buttons {
  @apply flex flex-col gap-2 flex-shrink-0;
  width: 70px;
}

.multiply-btn,
.divide-btn {
  @apply w-full py-2 rounded-lg font-semibold text-sm;
  @apply bg-primary-500 text-white;
  @apply hover:bg-primary-600;
  @apply disabled:opacity-40 disabled:cursor-not-allowed;
  @apply transition-all duration-150;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1;
}

.divide-btn {
  @apply bg-secondary-500;
  @apply hover:bg-secondary-600;
  @apply focus:ring-secondary-500;
}
</style>
