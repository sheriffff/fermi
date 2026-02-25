import readXlsxFile from 'read-excel-file'

let questionsCache = null

async function loadExcel() {
  if (questionsCache) return questionsCache

  const response = await fetch('/questions.xlsx')
  const blob = await response.blob()

  const questionsRaw = await readXlsxFile(blob, { sheet: 'questions' })
  const questions = questionsRaw
    .slice(1)
    .filter(row => row[3])
    .map(row => ({
      id: row[2],
      category: row[0],
      level: row[1],
      texto: row[3]
    }))

  const testsRaw = await readXlsxFile(blob, { sheet: 'tests' })
  const testsData = testsRaw.slice(1)
  const tests = {}

  for (const row of testsData) {
    const testId = row[0]
    if (!tests[testId]) {
      tests[testId] = []
    }
    tests[testId].push(row[1])
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

let playQuestionsCache = null

async function loadPlayQuestions() {
  if (playQuestionsCache) return playQuestionsCache

  const response = await fetch('/questions.xlsx')
  const blob = await response.blob()

  const raw = await readXlsxFile(blob, { sheet: 'other_questions' })
  const headers = raw[0].map(h => h ? h.toString().trim().toLowerCase() : '')
  const colId = headers.indexOf('id_question')
  const colP05 = headers.indexOf('p05')
  const colP95 = headers.indexOf('p95')
  const colQuestion = headers.indexOf('question')

  playQuestionsCache = raw
    .slice(1)
    .filter(row => row[colQuestion !== -1 ? colQuestion : 1])
    .map(row => {
      const p05 = colP05 !== -1 && row[colP05] != null ? Number(row[colP05]) : null
      const p95 = colP95 !== -1 && row[colP95] != null ? Number(row[colP95]) : null
      const hasRange = p05 != null && p95 != null && !isNaN(p05) && !isNaN(p95)
      return {
        id: parseInt(row[colId !== -1 ? colId : 0]),
        texto: row[colQuestion !== -1 ? colQuestion : 1],
        p05: hasRange ? p05 : null,
        p95: hasRange ? p95 : null
      }
    })

  return playQuestionsCache
}

export async function getRandomPlayQuestion() {
  const questions = await loadPlayQuestions()
  const randomIndex = Math.floor(Math.random() * questions.length)
  return questions[randomIndex]
}
