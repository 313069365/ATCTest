/**
 * 进度数据的打包/解包与持久化
 */

import { STORAGE_KEY, storage } from "./useStorage";
import { schemaRead, schemaWrite } from "./dataSchema";
import { getStrategy } from "@/infrastructure/question-types";

export function packProgress(
  questions,
  userAnswers,
  answerChecked,
  answerStatus,
) {
  const result = {};
  questions.forEach((q) => {
    const strategy = getStrategy(q.type);
    result[q.id] = strategy?.pack
      ? strategy.pack(q.id, userAnswers?.[q.id], answerChecked?.[q.id], answerStatus?.[q.id], q)
      : { selected: userAnswers?.[q.id], checked: answerChecked?.[q.id] || false, status: answerStatus?.[q.id] || 'unanswered' };
  });
  return result;
}

export function unpackProgress(packedAnswers) {
  const userAnswers = {};
  const answerChecked = {};
  const answerStatus = {};

  if (packedAnswers) {
    Object.entries(packedAnswers).forEach(([qId, data]) => {
      userAnswers[qId] = data?.selected;
      answerChecked[qId] = data?.checked;
      answerStatus[qId] = data?.status;
    });
  }

  return { userAnswers, answerChecked, answerStatus };
}

export function getPracticeKey(config) {
  const bank = config?.bank || config || {};
  return `${bank.category || ''}_${bank.scope || ''}_${bank.subject || ''}`;
}

export function savePracticeProgress(
  config,
  currentIndex,
  currentSubIndex,
  questions,
  userAnswers,
  answerChecked,
  answerStatus,
  elapsedSeconds,
  shuffleSeed,
) {
  const answers = packProgress(
    questions,
    userAnswers,
    answerChecked,
    answerStatus,
  );

  const key = getPracticeKey(config);
  const map = schemaRead(STORAGE_KEY.PRACTICE_PROGRESS) || {};

  map[key] = {
    config: { ...config, shuffleSeed },
    progress: {
      currentIndex,
      currentSubIndex,
      questionIds: questions.map((q) => q.id),
      answers,
    },
    meta: {
      timestamp: Date.now(),
      elapsedSeconds,
    },
  };

  schemaWrite(STORAGE_KEY.PRACTICE_PROGRESS, map);
}

export function loadPracticeProgress() {
  const data = schemaRead(STORAGE_KEY.PRACTICE_PROGRESS);

  if (!data) return {};

  if (data.config) {
    const key = getPracticeKey(data.config);
    const map = { [key]: data };
    schemaWrite(STORAGE_KEY.PRACTICE_PROGRESS, map);
    return map;
  }

  return data;
}
