<script setup>
const props = defineProps({
  fermiInput: { type: Object, default: null },
  submitDisabled: { type: Boolean, default: true },
  isLastQuestion: { type: Boolean, default: false }
})

const emit = defineEmits(['submit'])

function press(char) {
  props.fermiInput?.appendChar(char)
}

function backspace() {
  props.fermiInput?.deleteChar()
}

function clear() {
  props.fermiInput?.clearAll()
}

function multiply() {
  props.fermiInput?.multiplyByThousand()
}

function divide() {
  props.fermiInput?.divideByThousand()
}
</script>

<template>
  <div class="keypad-wrapper">
    <div class="keypad-ops">
      <button
        @click="divide"
        :disabled="!fermiInput?.canDivide"
        class="key-op"
      >/1000</button>
      <button
        @click="multiply"
        :disabled="!fermiInput?.canMultiply"
        class="key-op key-op-multiply"
      >x1000</button>
    </div>

    <div class="keypad-grid">
      <button @click="press('1')" class="key">1</button>
      <button @click="press('2')" class="key">2</button>
      <button @click="press('3')" class="key">3</button>

      <button @click="press('4')" class="key">4</button>
      <button @click="press('5')" class="key">5</button>
      <button @click="press('6')" class="key">6</button>

      <button @click="press('7')" class="key">7</button>
      <button @click="press('8')" class="key">8</button>
      <button @click="press('9')" class="key">9</button>

      <button @click="clear" class="key key-clear">C</button>
      <button @click="press('0')" class="key">0</button>
      <button @click="backspace" class="key key-del">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l7-7 11 0 0 14-11 0z" />
        </svg>
      </button>
    </div>

    <div class="keypad-submit-row">
      <button
        @click="emit('submit')"
        :disabled="submitDisabled"
        class="key-submit"
      >
        {{ isLastQuestion ? 'Finalizar' : 'Siguiente' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../../assets/main.css";

.keypad-wrapper {
  @apply fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.keypad-grid {
  @apply grid grid-cols-3 gap-px bg-neutral-200 mx-px;
}

.key {
  @apply bg-white py-3 text-lg font-medium text-neutral-800 active:bg-neutral-100 transition-colors;
}

.key-clear {
  @apply text-base font-semibold text-red-400;
}

.key-del {
  @apply text-neutral-500;
}

.keypad-ops {
  @apply grid grid-cols-2 gap-px bg-neutral-200 mx-px mt-px;
}

.key-op {
  @apply bg-white py-3 text-sm font-semibold text-secondary-600 active:bg-neutral-100 transition-colors;
}

.key-op:disabled {
  @apply text-neutral-300;
}

.key-op-multiply {
  @apply text-primary-600;
}

.key-op-multiply:disabled {
  @apply text-neutral-300;
}

.keypad-submit-row {
  @apply mt-2 mx-px mb-px;
}

.key-submit {
  @apply w-full bg-primary-500 py-4 text-base font-bold text-white active:bg-primary-600 transition-colors;
}

.key-submit:disabled {
  @apply bg-neutral-300;
}
</style>
