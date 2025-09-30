<!-- app/components/ToastHost.vue -->
<template>
  <div class="fixed z-50 bottom-4 right-4 flex flex-col gap-2">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="min-w-[240px] max-w-[90vw] rounded-lg px-3 py-2 shadow border bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
      :class="{
        'border-blue-400': t.type === 'info',
        'border-green-500': t.type === 'success',
        'border-red-500': t.type === 'error',
      }"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-center gap-3">
        <span class="text-sm">{{ t.message }}</span>
        <button
          v-if="t.actionLabel"
          class="ml-auto text-xs underline"
          @click="onAction(t)"
        >
          {{ t.actionLabel }}
        </button>
        <button
          class="text-xs opacity-70 hover:opacity-100"
          aria-label="Close"
          @click="remove(t.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "../composables/useToast";
const { toasts, remove } = useToast();

function onAction(t: any) {
  try {
    t.onAction?.();
  } finally {
    remove(t.id);
  }
}
</script>
