import * as XLSX from 'xlsx'

let questionsCache = null

async function loadExcel() {
  if (questionsCache) return questionsCache

  const response = await fetch('/questions.xlsx')
  const arrayBuffer = await response.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const questionsSheet = workbook.Sheets['questions']
  const questionsRaw = XLSX.utils.sheet_to_json(questionsSheet, { header: ['category', 'level', 'text'] })

  const questions = questionsRaw
    .slice(1)
    .filter(q => q.text && q.text !== 'Prueba')
    .map((q, index) => ({
      id: index + 1,
      category: q.category,
      level: q.level,
      texto: q.text
    }))

  const testsSheet = workbook.Sheets['tests']
  const testsRaw = XLSX.utils.sheet_to_json(testsSheet, { header: ['test', 'category', 'level'] })

  const testsData = testsRaw.slice(1)
  const tests = {}

  for (const row of testsData) {
    const testId = row.test
    if (!tests[testId]) {
      tests[testId] = []
    }
    tests[testId].push({
      category: row.category,
      level: row.level
    })
  }

  questionsCache = { questions, tests }
  return questionsCache
}

export async function getAllQuestions() {
  const { questions } = await loadExcel()
  return questions
}

export async function getTestQuestions(testId) {
  const { questions, tests } = await loadExcel()
  const testConfig = tests[testId]

  if (!testConfig) {
    console.error(`Test ${testId} no encontrado`)
    return []
  }

  const testQuestions = []

  for (const config of testConfig) {
    const question = questions.find(
      q => q.category === config.category && q.level === config.level
    )

    if (question) {
      testQuestions.push(question)
    } else {
      console.warn(`Pregunta no encontrada: ${config.category} nivel ${config.level}`)
    }
  }

  return testQuestions
}

export async function getRandomQuestion() {
  const questions = await getAllQuestions()
  const randomIndex = Math.floor(Math.random() * questions.length)
  return questions[randomIndex]
}

export async function getAvailableTests() {
  const { tests } = await loadExcel()
  return Object.keys(tests).sort()
}
