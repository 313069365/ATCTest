import { reactive } from "vue";

export function useConfirm() {
  const state = reactive({
    visible: false,
    title: "提示",
    message: "",
    confirmText: "确定",
    cancelText: "取消",
    onConfirm: null,
    onCancel: null,
  });

  let resolveCallback = null;

  function show(message, options = {}) {
    state.message = message;
    state.title = options.title || "提示";
    state.confirmText = options.confirmText || "确定";
    state.cancelText = options.cancelText || "取消";
    state.onConfirm = handleConfirm;
    state.onCancel = handleCancel;
    state.visible = true;

    return new Promise((resolve) => {
      resolveCallback = resolve;
    });
  }

  function handleConfirm() {
    state.visible = false;
    resolveCallback?.(true);
  }

  function handleCancel() {
    state.visible = false;
    resolveCallback?.(false);
  }

  return { state, show, handleConfirm, handleCancel };
}
