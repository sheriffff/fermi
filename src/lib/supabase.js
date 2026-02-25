import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    global: {
      headers: { Authorization: `Bearer ${supabaseKey}` }
    }
  }
)

let dbEnabled = import.meta.env.VITE_LOG_TO_DDBB !== 'false'

export function setDbEnabled(value) {
  dbEnabled = value
}

function getDeviceType() {
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(ua))) return 'tablet'
  if (/mobi|android|iphone|ipod|phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

export async function logDownload() {
  if (!dbEnabled) return
  const { error } = await supabase
    .from('logs_download')
    .insert({})

  if (error) throw error
}

export async function createUserOnline({ age, sex, piVsE, whichTestsBefore, userAlias, testModel }) {
  if (!dbEnabled) return 'fake-user-id'
  const id = crypto.randomUUID()
  const { error } = await supabase
    .from('users_online')
    .insert({
      id,
      age,
      sex: sex || null,
      pi_vs_e: piVsE,
      which_tests_before: whichTestsBefore,
      user_alias: userAlias || null,
      test_model: testModel,
      user_agent: navigator.userAgent,
      device_type: getDeviceType()
    })

  if (error) throw error
  return id
}

export async function saveResponsesOnline(userId, testModel, responses) {
  if (!dbEnabled) return
  const rows = responses.map(r => ({
    user_id: userId,
    test_model: testModel,
    question_n: r.questionN,
    response: r.response,
    time: r.time
  }))

  const { error } = await supabase
    .from('responses_online')
    .insert(rows)

  if (error) throw error
}

export async function createUserPaper({ age, sex, timeOfDay, favoriteSubject, mathMarkLastPeriod, isPhysicsChemistryStudent, schoolType, mood, testModel }) {
  if (!dbEnabled) return 'fake-user-id'
  const id = crypto.randomUUID()
  const { error } = await supabase
    .from('users_paper')
    .insert({
      id,
      age,
      sex,
      time_of_day: timeOfDay || null,
      favorite_subject: favoriteSubject || null,
      math_mark_last_period: mathMarkLastPeriod ?? null,
      is_physics_chemistry_student: isPhysicsChemistryStudent || false,
      school_type: schoolType || null,
      mood: mood || null,
      test_model: testModel
    })

  if (error) throw error
  return id
}

export async function saveResponsesPaper(userId, testModel, responses) {
  if (!dbEnabled) return
  const rows = responses.map(r => ({
    user_id: userId,
    test_model: testModel,
    question_n: r.questionN,
    base_a: r.baseA,
    exp_b: r.expB
  }))

  const { error } = await supabase
    .from('responses_paper')
    .insert(rows)

  if (error) throw error
}

export async function savePlayResponse({ idPlayQuestion, response, time }) {
  if (!dbEnabled) return
  const { error } = await supabase
    .from('responses_play_random')
    .insert({
      id_play_question: idPlayQuestion,
      response,
      time,
      user_agent: navigator.userAgent,
      device_type: getDeviceType()
    })

  if (error) throw error
}

export async function uploadScribble(userId, file) {
  if (!dbEnabled) return 'fake-path'
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) throw new Error('El archivo supera 5MB')

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('scribbles')
    .upload(path, file)

  if (error) throw error
  return path
}

export async function getOnlineAges() {
  const { data, error } = await supabase
    .from('users_online')
    .select('age')

  if (error) throw error
  return data.map(r => r.age)
}

export async function exportTable(table) {
  const { data, error } = await supabase
    .from(table)
    .select('*')

  if (error) throw error
  return data
}
