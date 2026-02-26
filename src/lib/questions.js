import readXlsxFile from 'read-excel-file'

let questionsCache = null

async function loadExcel() {
  if (questionsCache) return questionsCache

  const response = await fetch('/questions.xlsx')
  const blob = await response.blob()

  const questionsRaw = await readXlsxFile(blob, { sheet: 'questions' })
  const headers = questionsRaw[0]
  const col = name => headers.indexOf(name)
  const questions = questionsRaw
    .slice(1)
    .filter(row => row[col('question')])
    .map(row => {
      const p05 = row[col('p05')] != null ? Number(row[col('p05')]) : null
      const p95 = row[col('p95')] != null ? Number(row[col('p95')]) : null
      const hasRange = p05 != null && p95 != null && !isNaN(p05) && !isNaN(p95)
      return {
        id: row[col('id_question')],
        texto: row[col('question')],
        p05: hasRange ? p05 : null,
        p95: hasRange ? p95 : null
      }
    })

  const testsRaw = await readXlsxFile(blob, { sheet: 'tests' })
  const tHeaders = testsRaw[0]
  const tCol = name => tHeaders.indexOf(name)
  const tests = {}

  for (const row of testsRaw.slice(1)) {
    const testId = row[tCol('test')]
    if (!tests[testId]) {
      tests[testId] = []
    }
    tests[testId].push(row[tCol('id_question')])
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
  const questionIds = tests[testId]

  if (!questionIds) {
    console.error(`Test ${testId} no encontrado`)
    return []
  }

  const questionsById = new Map(questions.map(q => [q.id, q]))
  const testQuestions = []

  for (const qId of questionIds) {
    const question = questionsById.get(qId)
    if (question) {
      testQuestions.push(question)
    } else {
      console.warn(`Pregunta no encontrada: id ${qId}`)
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

export async function getRandomPlayQuestion() {
  const { questions, tests } = await loadExcel()
  const testIds = new Set(Object.values(tests).flat())
  const playQuestions = questions.filter(q => !testIds.has(q.id))
  const randomIndex = Math.floor(Math.random() * playQuestions.length)
  return playQuestions[randomIndex]
}
