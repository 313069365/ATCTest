/**
 * 题型处理 Composable
 */

import { computed, isRef } from "vue";
import {
  hasUserAnswer as checkHasUserAnswer,
  getDisplayConfig,
  PRACTICE_MODE,
  SHOW_ANSWER_MODE,
} from "@/domain/config/questionConfig";

function getValue(val) {
  if (typeof val === "function") return val();
  if (isRef(val)) return val.value;
  return val;
}

export function useQuestionHandler(options) {
  const practiceMode = computed(() => getValue(options.practiceMode) || PRACTICE_MODE.ANSWER);
  const showAnswerMode = computed(() => getValue(options.showAnswerMode) || SHOW_ANSWER_MODE.MANUAL);
  const question = computed(() => getValue(options.question) || null);
  const userAnswer = computed(() => getValue(options.userAnswer) ?? null);
  const isChecked = computed(() => getValue(options.isChecked) ?? false);

  const hasUserAnswer = computed(() => checkHasUserAnswer(userAnswer.value));

  const displayConfig = computed(() => {
    const q = question.value;
    const qType = q?.type || "single";
    return getDisplayConfig(practiceMode.value, showAnswerMode.value, qType, {
      hasUserAnswer: hasUserAnswer.value,
      isChecked: isChecked.value,
    });
  });

  const shouldShowAnswer = computed(() => displayConfig.value.shouldShowAnswer);
  const shouldShowCheckBtn = computed(() => displayConfig.value.shouldShowCheckBtn);
  const shouldAutoCheck = computed(() => displayConfig.value.shouldAutoCheck);

  return { shouldShowCheckBtn, shouldShowAnswer, shouldAutoCheck, hasUserAnswer };
}
