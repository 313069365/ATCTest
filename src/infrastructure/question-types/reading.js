import { getStrategy } from './index'

const capabilities = { canAutoCheck: false, needsManualCheck: true, canShuffle: false, isComposite: true }

function checkAnswer(question, userAnswer) {
  const result = {}
  ;(question.subs || []).forEach((sub, idx) => {
    const strategy = getStrategy(sub.type)
    result[idx] = strategy
      ? strategy.checkAnswer(sub, userAnswer?.[idx])
      : 'unknown'
  })
  return result
}

function pack(qId, userAnswer, checked, status, question) {
  const subs = question.subs || []
  const selected = {}
  const selectedText = {}
  const checkedObj = {}
  const statusObj = {}

  subs.forEach((sub, idx) => {
    selected[idx] = userAnswer?.[idx]
    checkedObj[idx] = checked?.[idx] || false
    statusObj[idx] = status?.[idx] || 'unanswered'

    const strategy = getStrategy(sub.type)
    if (strategy?.pack) {
      const packed = strategy.pack(sub.sid, userAnswer?.[idx], checked?.[idx], status?.[idx], sub)
      if (packed?.selectedText !== undefined) {
        selectedText[idx] = packed.selectedText
      }
    }
  })

  return {
    selected,
    selectedText: Object.keys(selectedText).length > 0 ? selectedText : undefined,
    checked: checkedObj,
    status: statusObj,
  }
}

function unpack(packed) {
  if (!packed) return { userAnswer: null, checked: null, status: null }
  return {
    userAnswer: packed.selected,
    checked: packed.checked,
    status: packed.status,
  }
}

export default { type: 'reading', capabilities, component: null, checkAnswer, pack, unpack }
