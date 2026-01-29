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

export async function logDownload() {
  const { error } = await supabase
    .from('logs_download')
    .insert({})

  if (error) throw error
}

export async function createUserOnline({ age, sex, piVsE, nTestsBefore, userAlias, testModel }) {
  const { data, error } = await supabase
    .from('users_online')
    .insert({
      age,
      sex,
      pi_vs_e: piVsE,
      n_tests_before: nTestsBefore,
      user_alias: userAlias || null,
      test_model: testModel,
      user_agent: navigator.userAgent
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function saveResponsesOnline(userId, testModel, responses) {
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

export async function createUserPaper({ profeId, aulaId, age, sex, timeOfDay, favoriteSubject, mathMarkLastPeriod, isPhysicsChemistryStudent, testModel }) {
  const { data, error } = await supabase
    .from('users_paper')
    .insert({
      profe_id: profeId || null,
      aula_id: aulaId || null,
      age,
      sex,
      time_of_day: timeOfDay || null,
      favorite_subject: favoriteSubject || null,
      math_mark_last_period: mathMarkLastPeriod ?? null,
      is_physics_chemistry_student: isPhysicsChemistryStudent || false,
      test_model: testModel
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function saveResponsesPaper(userId, testModel, responses) {
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
  const { error } = await supabase
    .from('responses_play_unique')
    .insert({
      id_play_question: idPlayQuestion,
      response,
      time
    })

  if (error) throw error
}

export async function exportTable(table) {
  const { data, error } = await supabase
    .from(table)
    .select('*')

  if (error) throw error
  return data
}
