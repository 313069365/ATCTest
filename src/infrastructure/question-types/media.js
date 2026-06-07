const capabilities = { canAutoCheck: true, needsManualCheck: false, canShuffle: false, isComposite: false }

function checkAnswer(question, userAnswer) {
  return 'unknown'
}

function pack(qId, userAnswer, checked, status, question) {
  return {
    selected: userAnswer,
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

export default { type: 'media', capabilities, component: null, checkAnswer, pack, unpack }
