import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Helper functions for common operations

/**
 * Registra un nuevo profesor y genera código de grupo
 */
export async function registrarProfesor({ nombre, centro, alumnosPrevistos }) {
  const { data, error } = await supabase
    .from('profesores')
    .insert({
      nombre: nombre || null,
      centro: centro || null,
      alumnos_previstos: alumnosPrevistos || 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Registra una descarga de PDF
 */
export async function registrarDescarga(idProfe, archivo) {
  const { error } = await supabase
    .from('log_descargas')
    .insert({
      id_profe: idProfe,
      archivo
    })

  if (error) throw error
}

/**
 * Obtiene las preguntas de un modelo específico
 */
export async function obtenerPreguntas(modelo) {
  const { data, error } = await supabase
    .from('preguntas')
    .select('*')
    .eq('modelo', modelo)
    .order('numero')

  if (error) throw error
  return data
}

/**
 * Guarda las respuestas del test online
 */
export async function guardarRespuestasOnline({
  edad,
  sexo,
  piVsE,
  segundaVez,
  modelo,
  respuestas,
  tiempos
}) {
  const { data, error } = await supabase
    .from('respuestas_online')
    .insert({
      edad,
      sexo,
      pi_vs_e: piVsE,
      segunda_vez: segundaVez,
      modelo,
      respuestas,
      tiempos,
      user_agent: navigator.userAgent
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Guarda respuestas de papel (admin)
 */
export async function guardarRespuestasPapel(respuestas) {
  const { data, error } = await supabase
    .from('respuestas_papel')
    .upsert(respuestas, { onConflict: 'id_grupo,alumno_idx,pregunta_num' })
    .select()

  if (error) throw error
  return data
}

/**
 * Obtiene todos los profesores/grupos para el selector admin
 */
export async function obtenerGrupos() {
  const { data, error } = await supabase
    .from('profesores')
    .select('id, codigo_grupo, nombre, centro, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Exporta una tabla a formato CSV
 */
export async function exportarTabla(tabla) {
  const { data, error } = await supabase
    .from(tabla)
    .select('*')

  if (error) throw error
  return data
}
