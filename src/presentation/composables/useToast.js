import { reactive } from "vue";

const state = reactive({
  visible: false,
  message: "",
  type: "info", // info | success | error
});

let hideTimer = null;

function show(message, options = {}) {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  state.message = message;
  state.type = options.type || "info";
  state.visible = true;

  const duration = options.duration ?? 2500;
  hideTimer = setTimeout(() => {
    state.visible = false;
    hideTimer = null;
  }, duration);
}

function success(message, options = {}) {
  show(message, { ...options, type: "success" });
}

function error(message, options = {}) {
  show(message, { ...options, type: "error" });
}

function info(message, options = {}) {
  show(message, { ...options, type: "info" });
}

export function useToast() {
  return { state, show, success, error, info };
}
