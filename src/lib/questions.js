import readXlsxFile from 'read-excel-file'

let questionsCache = null

async function loadExcel() {
  if (questionsCache) return questionsCache

  const response = await fetch('/questions.xlsx')
  const blob = await response.blob()

  const questionsRaw = await readXlsxFile(blob, { sheet: 'questions' })
  const questions = questionsRaw
    .slice(1)
    .filter(row => row[2] && row[2] !== 'Prueba')
    .map((row, index) => ({
      id: index + 1,
      category: row[0],
      level: row[1],
      texto: row[2]
    }))

  const testsRaw = await readXlsxFile(blob, { sheet: 'tests' })
  const testsData = testsRaw.slice(1)
  const tests = {}

  for (const row of testsData) {
    const testId = row[0]
    if (!tests[testId]) {
      tests[testId] = []
    }
    tests[testId].push({
      category: row[1],
      level: row[2]
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
