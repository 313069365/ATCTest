const capabilities = { canAutoCheck: true, needsManualCheck: false, canShuffle: false, isComposite: false }

function checkAnswer(question, userAnswer) {
  if (!question?.answer?.[0]) return 'unknown'
  if (typeof userAnswer !== 'number') return 'unanswered'

  const correctAnswer = question.answer[0].replace(/^[A-Z]\.\s*/, '')
  const userText = Array.isArray(question.options)
    ? question.options?.[userAnswer]?.replace(/^[A-Z]\.\s*/, '')
    : question.options?.[String.fromCharCode(65 + userAnswer)]?.replace(/^[A-Z]\.\s*/, '')

  return userText === correctAnswer ? 'correct' : 'wrong'
}

function pack(qId, userAnswer, checked, status, question) {
  const selectedText = question?.options && typeof userAnswer === 'number'
    ? question.options[userAnswer]
    : undefined
  return {
    selected: userAnswer,
    selectedText,
    checked: checked || false,
    status: status || 'unanswered',
  }
}

function unpack(packed) {
  return {
    userAnswer: packed?.selected,
    checked: packed?.checked,
    status: packed?.status,
  }
}

export default { type: 'boolean', capabilities, component: null, checkAnswer, pack, unpack }
