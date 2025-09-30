<!-- app/pages/index.vue -->
<template>
  <div class="max-w-3xl mx-auto pt-10 px-4">
    <!-- Header / controls -->
    <header
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6"
    >
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-semibold">Todo Pro</h1>
        <!-- realtime status -->
        <span
          class="text-xs"
          :class="realtimeReady ? 'text-green-600' : 'text-gray-400'"
          title="Realtime connection status"
        >
          {{ realtimeReady ? "live" : "offline" }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="queryInput"
          placeholder="Search..."
          class="border rounded px-2 py-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
        />
        <select
          v-model="localFilter"
          class="border rounded px-2 py-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select
          v-model="localSort"
          class="border rounded px-2 py-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>

        <button class="text-sm underline" @click="toggleTheme()">
          {{ isDark ? "Light" : "Dark" }} mode
        </button>
        <button class="text-sm underline" @click="doSignOut">Sign out</button>
      </div>
    </header>

    <!-- Add -->
    <form @submit.prevent="onAdd" class="flex gap-2 mb-6">
      <input
        v-model="title"
        placeholder="Add a task..."
        class="flex-1 border rounded px-3 py-2 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
      />
      <button
        class="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black"
      >
        Add
      </button>
      <button
        type="button"
        class="px-3 py-2 rounded border dark:border-gray-800"
        @click="store.clearCompleted?.()"
      >
        Clear completed
      </button>
    </form>

    <!-- Pager summary -->
    <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">
      <span v-if="store.total">
        Showing {{ store.showingFrom }}–{{ store.showingTo }} of
        {{ store.total }} (10 per page)
      </span>
      <span v-else>No results</span>
    </div>
    <ToastHost />

    <!-- Loading / Empty -->
    <div v-if="store.loading" class="text-sm text-gray-500 dark:text-gray-400">
      Loading…
    </div>
    <div
      v-else-if="store.items.length === 0"
      class="text-sm text-gray-500 dark:text-gray-400"
    >
      No todos match.
    </div>

    <!-- List -->
    <ul v-else class="space-y-2">
      <li
        v-for="todo in store.items"
        :key="todo.id"
        class="flex items-center gap-3 bg-white border rounded px-3 py-2 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
      >
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo, $event)"
        />
        <template v-if="editingId === todo.id">
          <input
            ref="editInput"
            v-model="editTitle"
            class="flex-1 border rounded px-2 py-1 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
            @keyup.enter="saveEdit(todo)"
            @keyup.esc="cancelEdit"
            @blur="saveEdit(todo)"
          />
          <button class="text-xs underline" @click="saveEdit(todo)">
            Save
          </button>
          <button class="text-xs underline" @click="cancelEdit">Cancel</button>
        </template>
        <template v-else>
          <span
            class="flex-1"
            :class="todo.completed ? 'line-through text-gray-500' : ''"
            @dblclick="startEdit(todo)"
          >
            {{ todo.title }}
          </span>
          <NuxtLink :to="`/todos/${todo.id}`" class="text-xs underline">
            Details
          </NuxtLink>
          <button class="text-xs underline" @click="startEdit(todo)">
            Edit
          </button>
          <button class="text-xs underline ml-auto" @click="del(todo.id)">
            Delete
          </button>
        </template>
      </li>
    </ul>

    <!-- Pager controls -->
    <div class="mt-4 flex items-center justify-between">
      <button
        class="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-800"
        :disabled="!store.hasPrev"
        @click="goPrev"
      >
        Previous
      </button>
      <div class="text-sm">Page {{ store.page }} / {{ store.pageCount }}</div>
      <button
        class="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-800"
        :disabled="!store.hasNext"
        @click="goNext"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed, onMounted } from "vue";
import { navigateTo, useHead } from "nuxt/app";
import { useAuth } from "../composables/useAuth";
import { useTheme } from "../composables/useTheme";
import { useTodosStore } from "../stores/todos";
import ToastHost from "../components/ToastHost.vue";

// 👉 bring in Id from the store type
import type { Todo } from "../stores/todos";
type Id = Todo["id"];

useHead({ title: "Todo Pro" });

const { isAuthed, signOut } = useAuth();
const { isDark, toggle: toggleTheme } = useTheme();
const store = useTodosStore();

// realtime flag (safe even if store doesn’t expose it yet)
const realtimeReady = computed<boolean>(
  () => (store as any).realtimeReady ?? false
);

// local form/controls state
const title = ref("");

// controls mirror for debounce + watchers
const queryInput = ref(store.q);
const localFilter = ref(store.filter);
const localSort = ref(store.sort);

// debounce search
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(queryInput, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    store.setSearch?.(String(val || ""));
    store.setPage?.(1);
    store.fetchTodos?.();
  }, 300);
});

// filter/sort watchers
watch(localFilter, (val) => {
  store.setFilter?.(val as any);
  store.fetchTodos?.();
});
watch(localSort, (val) => {
  store.setSort?.(val as any);
  store.fetchTodos?.();
});

// edit state
const editingId = ref<Id | null>(null);
const editTitle = ref("");
const editInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  if (!isAuthed.value) return navigateTo("/login");
  await store.fetchTodos?.();
  (store as any).startRealtime?.(); // subscribe if available
});

const onAdd = async () => {
  if (!title.value.trim()) return;
  await store.addTodo?.(title.value.trim());
  title.value = "";
};

const toggleTodo = async (todo: Todo, e: Event) => {
  const target = e.target as HTMLInputElement;
  await store.toggleTodo?.(todo.id as Id, target.checked);
};

const del = async (id: Id) => {
  // ✅ fix the typo here
  await store.removeTodo?.(id);
};

const startEdit = async (todo: Todo) => {
  editingId.value = todo.id;
  editTitle.value = todo.title;
  await nextTick();
  editInput.value?.focus();
  editInput.value?.select();
};

const saveEdit = async (todo: Todo) => {
  const newTitle = editTitle.value.trim();
  if (!newTitle) await store.removeTodo?.(todo.id as Id);
  else if (newTitle !== todo.title)
    await store.updateTitle?.(todo.id as Id, newTitle);
  editingId.value = null;
};

const cancelEdit = () => {
  editingId.value = null;
};

const doSignOut = async () => {
  await signOut();
};

// pager buttons
const goPrev = async () => {
  if (!store.hasPrev) return;
  store.setPage?.(store.page - 1);
  await store.fetchTodos?.();
};

const goNext = async () => {
  if (!store.hasNext) return;
  store.setPage?.(store.page + 1);
  await store.fetchTodos?.();
};
</script>
