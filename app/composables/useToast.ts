// app/composables/useToast.ts
import { reactive } from "vue";

type ToastType = "info" | "success" | "error";
type Toast = {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  timeout?: number;
};

const state = reactive<{ list: Toast[] }>({
  list: [],
});

function genId() {
  return (
    (globalThis.crypto && (crypto as any).randomUUID?.()) ||
    `t_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

function remove(id: string) {
  const i = state.list.findIndex((t) => t.id === id);
  if (i >= 0) state.list.splice(i, 1);
}

function push(
  message: string,
  opts: Partial<Omit<Toast, "id" | "message" | "type">> & {
    type?: ToastType;
  } = {}
) {
  const id = genId();
  const toast: Toast = {
    id,
    message,
    type: opts.type ?? "info",
    actionLabel: opts.actionLabel,
    onAction: opts.onAction,
    timeout: opts.timeout ?? 4000,
  };
  state.list.push(toast);
  if (toast.timeout && !toast.actionLabel) {
    setTimeout(() => remove(id), toast.timeout);
  }
  return id;
}

export function useToast() {
  return {
    toasts: state.list,
    push,
    remove,
  };
}
