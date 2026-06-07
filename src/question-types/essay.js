const capabilities = { canAutoCheck: false, needsManualCheck: true, canShuffle: false, isComposite: false }

function checkAnswer(question, userAnswer) {
  return 'unknown'
}

function pack(qId, userAnswer, checked, status, question) {
  return {
    selected: userAnswer,
    selectedText: typeof userAnswer === 'string' ? userAnswer : undefined,
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

export default { type: 'essay', capabilities, component: null, checkAnswer, pack, unpack }
