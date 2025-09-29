<template>
  <div class="max-w-2xl mx-auto pt-10 px-4">
    <NuxtLink to="/" class="text-sm underline">← Back</NuxtLink>

    <div v-if="loading" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
      Loading…
    </div>

    <div
      v-else-if="!todo"
      class="mt-4 rounded border bg-white p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
    >
      <h1 class="text-xl font-semibold mb-2">Todo not found</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        This item doesn’t exist or you don’t have access.
      </p>
    </div>

    <div
      v-else
      class="mt-4 rounded border bg-white p-4 text-gray-900 space-y-4 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
    >
      <header class="flex items-start justify-between gap-3">
        <h1 class="text-xl font-semibold">Todo details</h1>
        <button class="text-sm underline" @click="doSignOut">Sign out</button>
      </header>

      <!-- status -->
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="onToggle($event)"
          class="accent-black dark:accent-white"
        />
        <span
          :class="
            todo.completed
              ? 'line-through text-gray-600 dark:text-gray-400'
              : ''
          "
        >
          {{ todo.title }}
        </span>
      </div>

      <!-- edit title -->
      <div class="flex items-center gap-2">
        <input
          v-model="draftTitle"
          class="flex-1 border rounded px-2 py-1 bg-white text-gray-900 border-gray-300 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
        />
        <button
          class="px-3 py-1 border rounded border-gray-300 dark:border-gray-700"
          @click="onSaveTitle"
          :disabled="saving"
        >
          {{ saving ? "Saving…" : "Save" }}
        </button>
        <button
          class="px-3 py-1 border rounded border-gray-300 dark:border-gray-700"
          @click="onResetTitle"
          :disabled="saving"
        >
          Reset
        </button>
      </div>

      <!-- meta -->
      <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div>
          <strong>ID:</strong> <code>{{ todo.id }}</code>
        </div>
        <div><strong>Created:</strong> {{ formattedCreated }}</div>
        <div>
          <strong>Status:</strong> {{ todo.completed ? "Completed" : "Active" }}
        </div>
      </div>

      <!-- actions -->
      <div class="pt-2">
        <button
          class="px-3 py-1 border rounded text-red-600 border-red-600 dark:border-red-500"
          @click="onDelete"
          :disabled="deleting"
        >
          {{ deleting ? "Deleting…" : "Delete" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, navigateTo, useNuxtApp } from "nuxt/app";
import { useAuth } from "../../composables/useAuth";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  inserted_at: string;
  user_id: string;
};

const route = useRoute();
const id = String(route.params.id);

const { isAuthed, signOut } = useAuth();
const { $supabase: supabase } = useNuxtApp() as any;

const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const todo = ref<Todo | null>(null);
const draftTitle = ref("");

const formattedCreated = computed(() => {
  const d = todo.value?.inserted_at ? new Date(todo.value.inserted_at) : null;
  return d ? d.toLocaleString() : "—";
});

onMounted(async () => {
  if (!isAuthed.value) return navigateTo("/login");
  await load();
});

async function load() {
  loading.value = true;
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("id", id)
    .single();
  loading.value = false;
  if (error) {
    todo.value = null;
    return;
  }
  todo.value = data as Todo;
  draftTitle.value = todo.value.title;
}

async function onSaveTitle() {
  if (!todo.value) return;
  const newTitle = draftTitle.value.trim();
  if (!newTitle || newTitle === todo.value.title) return;
  saving.value = true;
  const { error } = await supabase
    .from("todos")
    .update({ title: newTitle })
    .eq("id", todo.value.id);
  saving.value = false;
  if (!error) await load();
}

async function onToggle(e: Event) {
  if (!todo.value) return;
  const checked = (e.target as HTMLInputElement).checked;
  const { error } = await supabase
    .from("todos")
    .update({ completed: checked })
    .eq("id", todo.value.id);
  if (!error) await load();
}

function onResetTitle() {
  if (!todo.value) return;
  draftTitle.value = todo.value.title;
}

async function onDelete() {
  if (!todo.value) return;
  if (!confirm("Delete this todo?")) return;
  deleting.value = true;
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", todo.value.id);
  deleting.value = false;
  if (!error) navigateTo("/");
}

async function doSignOut() {
  await signOut();
}
</script>
