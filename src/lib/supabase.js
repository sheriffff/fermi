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

export async function createUserOnline({ age, piVsE, whichTestsBefore, userAlias, testModel, amigosTest, email }) {
  if (!dbEnabled) return 'fake-user-id'
  const id = crypto.randomUUID()
  const { error } = await supabase
    .from('users_online')
    .insert({
      id,
      age,
      pi_vs_e: piVsE,
      which_tests_before: whichTestsBefore,
      user_alias: userAlias || null,
      test_model: testModel,
      amigos_test: amigosTest || null,
      email: email || null,
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

const ALLOWED_SCRIBBLE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif']

export async function uploadScribble(userId, file) {
  if (!dbEnabled) return 'fake-path'
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) throw new Error('El archivo supera 5MB')

  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!ALLOWED_SCRIBBLE_EXT.includes(ext)) throw new Error('Solo se permiten imágenes (jpg, png, webp, gif)')
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('scribbles')
    .upload(path, file)

  if (error) throw error

  const { error: dbError } = await supabase
    .from('scribbles')
    .insert({ user_id: userId, storage_path: path })

  if (dbError) throw dbError

  return path
}

export async function getScribbleUrls(userId) {
  const { data, error } = await supabase
    .from('scribbles')
    .select('storage_path')
    .eq('user_id', userId)
  if (error) throw error
  if (!data.length) return []
  const paths = data.map(row => row.storage_path)
  const { data: signed, error: signError } = await supabase.storage
    .from('scribbles')
    .createSignedUrls(paths, 3600)
  if (signError) throw signError
  return signed.map(s => s.signedUrl)
}

export async function getOnlineAges() {
  const { data, error } = await supabase
    .from('users_online')
    .select('age')

  if (error) throw error
  return data.map(r => r.age)
}

export async function getOnlineDemographics() {
  const { data, error } = await supabase
    .from('users_online')
    .select('age, sex')

  if (error) throw error
  return data
}

export async function saveFeedback({ name, message }) {
  if (!dbEnabled) return
  const { error } = await supabase
    .from('feedback')
    .insert({ name: name || null, message })

  if (error) throw error
}

export async function saveResultsEmail(email) {
  if (!dbEnabled) return
  const { error } = await supabase
    .from('email_subscriptions')
    .insert({ email })

  if (error) throw error
}

const EXPORTABLE_TABLES = ['logs_download', 'users_online', 'responses_online', 'users_paper', 'responses_paper', 'responses_play_random', 'feedback', 'scribbles', 'view_responses_online', 'view_responses_paper']

export async function exportTable(table) {
  if (!EXPORTABLE_TABLES.includes(table)) throw new Error(`Table not exportable: ${table}`)
  const { data, error } = await supabase
    .from(table)
    .select('*')

  if (error) throw error
  return data
}

export async function getTableCount(table) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count
}

export async function getTableLatest(table) {
  const { data, error } = await supabase
    .from(table)
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  return data?.[0]?.created_at || null
}

export async function getResponsesByModel() {
  const tables = ['responses_online', 'responses_paper']
  const counts = { A: 0, B: 0, C: 0, D: 0 }

  for (const table of tables) {
    for (const model of ['A', 'B', 'C', 'D']) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('test_model', model)

      if (error) throw error
      counts[model] += count
    }
  }
  return counts
}

export async function getTableRecent(table, limit = 10, select = '*') {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getTableCountsByDay(table, days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from(table)
    .select('created_at')
    .gte('created_at', since.toISOString())

  if (error) throw error

  const byDay = {}
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    byDay[d.toISOString().split('T')[0]] = 0
  }

  for (const row of data || []) {
    const day = row.created_at.split('T')[0]
    if (byDay[day] !== undefined) byDay[day]++
  }

  return Object.entries(byDay).map(([date, count]) => ({ date, count }))
}

export async function getTableCountsByWeek(table, sinceDate = '2025-03-01') {
  const { data, error } = await supabase
    .from(table)
    .select('created_at')
    .gte('created_at', sinceDate)

  if (error) throw error

  const byWeek = {}
  for (const row of data || []) {
    const d = new Date(row.created_at)
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
    const key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
    byWeek[key] = (byWeek[key] || 0) + 1
  }

  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }))
}

export async function getAllScribbleUrls() {
  const { data, error } = await supabase
    .from('scribbles')
    .select('storage_path, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!data.length) return []

  const paths = data.map(row => row.storage_path)
  const { data: signed, error: signError } = await supabase.storage
    .from('scribbles')
    .createSignedUrls(paths, 3600)

  if (signError) throw signError
  return signed.map((s, i) => ({ url: s.signedUrl, created_at: data[i].created_at }))
}

export async function getActivityByDay(days = 14) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  const { data, error } = await supabase
    .from('users_online')
    .select('created_at')
    .gte('created_at', sinceISO)
    .order('created_at', { ascending: true })

  if (error) throw error

  const byDay = {}
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    byDay[d.toISOString().split('T')[0]] = 0
  }

  for (const row of data || []) {
    const day = row.created_at.split('T')[0]
    if (byDay[day] !== undefined) byDay[day]++
  }

  return Object.entries(byDay).map(([date, count]) => ({ date, count }))
}
