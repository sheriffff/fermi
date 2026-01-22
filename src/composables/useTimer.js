import { ref, computed, onUnmounted } from 'vue'

/**
 * Composable para manejar el cronómetro del test
 * @param {number} initialSeconds - Segundos iniciales (default: 180)
 * @param {Function} onTimeUp - Callback cuando el tiempo llega a 0
 */
export function useTimer(initialSeconds = 180, onTimeUp = null) {
  const seconds = ref(initialSeconds)
  const isRunning = ref(false)
  let intervalId = null

  // Tiempo formateado como MM:SS
  const formattedTime = computed(() => {
    const mins = Math.floor(seconds.value / 60)
    const secs = seconds.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  // Estado del timer para estilos
  const timerState = computed(() => {
    if (seconds.value <= 10) return 'danger'
    if (seconds.value <= 30) return 'warning'
    return 'normal'
  })

  // Porcentaje restante (para barra de progreso)
  const percentageRemaining = computed(() => {
    return (seconds.value / initialSeconds) * 100
  })

  // Clase CSS basada en el estado
  const timerClass = computed(() => {
    return `timer-${timerState.value}`
  })

  function start() {
    if (isRunning.value) return

    isRunning.value = true
    intervalId = setInterval(() => {
      if (seconds.value > 0) {
        seconds.value--
      } else {
        stop()
        if (onTimeUp && typeof onTimeUp === 'function') {
          onTimeUp()
        }
      }
    }, 1000)
  }

  function stop() {
    isRunning.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function reset(newSeconds = initialSeconds) {
    stop()
    seconds.value = newSeconds
  }

  function pause() {
    stop()
  }

  function resume() {
    start()
  }

  // Obtener tiempo transcurrido (para guardar)
  function getElapsedTime() {
    return initialSeconds - seconds.value
  }

  // Limpiar intervalo al desmontar
  onUnmounted(() => {
    stop()
  })

  return {
    seconds,
    formattedTime,
    timerState,
    timerClass,
    percentageRemaining,
    isRunning,
    start,
    stop,
    reset,
    pause,
    resume,
    getElapsedTime
  }
}
