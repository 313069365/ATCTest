const capabilities = { canAutoCheck: false, needsManualCheck: true, canShuffle: true, isComposite: false }

function checkAnswer(question, userAnswer) {
  if (!question?.answer?.[0]) return 'unknown'
  if (!Array.isArray(userAnswer)) return 'wrong'

  const correctSet = new Set(
    question.answer.map((a) => a.replace(/^[A-Z]\.\s*/, '')),
  )
  const userSet = new Set(
    (userAnswer || [])
      .map((i) => question.options?.[i]?.replace(/^[A-Z]\.\s*/, ''))
      .filter(Boolean),
  )

  if (correctSet.size === userSet.size && [...correctSet].every((v) => userSet.has(v)))
    return 'correct'
  if ([...userSet].some((v) => !correctSet.has(v))) return 'wrong'
  return 'partial'
}

function pack(qId, userAnswer, checked, status, question) {
  const selectedText = Array.isArray(userAnswer)
    ? userAnswer.map(i => question?.options?.[i]).filter(Boolean)
    : undefined
  return {
    selected: userAnswer,
    selectedText: selectedText?.length ? selectedText : undefined,
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

export default { type: 'multiple', capabilities, component: null, checkAnswer, pack, unpack }
