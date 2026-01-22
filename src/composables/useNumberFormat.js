import { computed } from 'vue'

/**
 * Composable para formatear números grandes de manera legible
 */
export function useNumberFormat() {

  /**
   * Formatea un número grande a texto legible
   * Ejemplos:
   *   1500 -> "1.500" o "1,5 mil"
   *   5200000 -> "5,2 millones"
   *   1234567890 -> "1.234 millones" o "1,23 mil millones"
   */
  function formatNumber(value) {
    if (value === null || value === undefined || value === '') {
      return ''
    }

    const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value

    if (isNaN(num)) {
      return ''
    }

    // Para números pequeños, solo formatear con separadores de miles
    if (Math.abs(num) < 10000) {
      return num.toLocaleString('es-ES')
    }

    const absNum = Math.abs(num)
    const sign = num < 0 ? '-' : ''

    // Definir escalas
    const scales = [
      { value: 1e12, singular: 'billón', plural: 'billones' },
      { value: 1e9, singular: 'mil millones', plural: 'mil millones' },
      { value: 1e6, singular: 'millón', plural: 'millones' },
      { value: 1e3, singular: 'mil', plural: 'mil' }
    ]

    for (const scale of scales) {
      if (absNum >= scale.value) {
        const scaled = absNum / scale.value
        const formatted = scaled.toLocaleString('es-ES', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        })
        const word = scaled === 1 ? scale.singular : scale.plural
        return `${sign}${formatted} ${word}`
      }
    }

    return num.toLocaleString('es-ES')
  }

  /**
   * Formatea un número con separadores de miles (sin palabras)
   */
  function formatWithSeparators(value) {
    if (value === null || value === undefined || value === '') {
      return ''
    }

    const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value

    if (isNaN(num)) {
      return ''
    }

    return num.toLocaleString('es-ES')
  }

  /**
   * Convierte notación científica (a × 10^b) a número
   */
  function fromScientificNotation(base, exponent) {
    if (base === null || base === undefined || exponent === null || exponent === undefined) {
      return null
    }
    return base * Math.pow(10, exponent)
  }

  /**
   * Formatea a notación científica legible
   */
  function toScientificNotation(value) {
    if (value === null || value === undefined || value === 0) {
      return { base: 0, exponent: 0, formatted: '0' }
    }

    const num = typeof value === 'number' ? value : parseFloat(value)

    if (isNaN(num)) {
      return { base: 0, exponent: 0, formatted: '0' }
    }

    const exponent = Math.floor(Math.log10(Math.abs(num)))
    const base = num / Math.pow(10, exponent)
    const roundedBase = Math.round(base * 100) / 100

    return {
      base: roundedBase,
      exponent,
      formatted: `${roundedBase} × 10^${exponent}`
    }
  }

  /**
   * Limpia un string de input para obtener solo dígitos
   */
  function cleanInput(value) {
    if (!value) return ''
    return value.toString().replace(/\D/g, '')
  }

  /**
   * Obtiene el orden de magnitud de un número
   */
  function getOrderOfMagnitude(value) {
    if (!value || value === 0) return 0
    return Math.floor(Math.log10(Math.abs(value)))
  }

  /**
   * Compara dos valores y devuelve la diferencia en órdenes de magnitud
   */
  function compareMagnitudes(value1, value2) {
    const mag1 = getOrderOfMagnitude(value1)
    const mag2 = getOrderOfMagnitude(value2)
    return Math.abs(mag1 - mag2)
  }

  return {
    formatNumber,
    formatWithSeparators,
    fromScientificNotation,
    toScientificNotation,
    cleanInput,
    getOrderOfMagnitude,
    compareMagnitudes
  }
}
