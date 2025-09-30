<!-- <template>
  <div class="max-w-sm mx-auto pt-24">
    <h1 class="text-2xl font-semibold mb-6">Sign in</h1>

    <div v-if="!supabase" class="text-red-600 text-sm mb-4">
      Supabase not configured. Set SUPABASE_URL and SUPABASE_KEY in .env and
      restart.
    </div>

    <form @submit.prevent="signIn" class="space-y-3">
      <input
        v-model="email"
        type="email"
        required
        placeholder="Email"
        class="w-full border rounded px-3 py-2"
      />
      <input
        v-model="password"
        type="password"
        required
        placeholder="Password"
        class="w-full border rounded px-3 py-2"
      />
      <button class="px-4 py-2 rounded bg-black text-white w-full">
        Sign in
      </button>
    </form>

    <p class="text-sm mt-4">
      No account?
      <button class="underline" @click="signUp">Create one</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useNuxtApp, navigateTo } from "nuxt/app";

const { $supabase: supabase } = useNuxtApp() as any;

const email = ref("");
const password = ref("");

const signIn = async () => {
  if (!supabase) return alert("Supabase not configured");
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) return alert(error.message);
  navigateTo("/");
};
const signUp = async () => {
  if (!supabase) return alert("Supabase not configured");
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });
  if (error) alert(error.message);
  else alert("Check your email to confirm.");
};

onMounted(async () => {
  if (!supabase) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) navigateTo("/");
});
</script> -->
<!-- pages/login.vue -->
<!-- <template>
  <div class="max-w-sm mx-auto pt-24">
    <h1 class="text-2xl font-semibold mb-6">Sign in</h1>

    <div v-if="!supabaseReady" class="text-red-600 text-sm mb-4">
      Supabase not configured. Set SUPABASE_URL and SUPABASE_KEY in .env and
      restart.
    </div>

    <form @submit.prevent="doSignIn" class="space-y-3">
      <input
        v-model="email"
        type="email"
        required
        placeholder="Email"
        class="w-full border rounded px-3 py-2"
      />
      <input
        v-model="password"
        type="password"
        required
        placeholder="Password"
        class="w-full border rounded px-3 py-2"
      />
      <button class="px-4 py-2 rounded bg-black text-white w-full">
        Sign in
      </button>
    </form>

    <p class="text-sm mt-4">
      No account?
      <button class="underline" @click="doSignUp">Create one</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useNuxtApp, navigateTo } from "nuxt/app";
import { useAuth } from "../composables/useAuth";

const { $supabase: supabase } = useNuxtApp() as any;
const supabaseReady = computed(() => !!supabase);

const { isAuthed, signIn, signUp } = useAuth();
const email = ref("");
const password = ref("");

const doSignIn = () =>
  signIn(email.value, password.value).catch((e) => alert(e.message));
const doSignUp = () =>
  signUp(email.value, password.value)
    .then(() => alert("Check your email to confirm."))
    .catch((e) => alert(e.message));

onMounted(() => {
  if (isAuthed.value) navigateTo("/");
});
</script> -->
<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div
      class="w-full max-w-md rounded-xl border bg-white/80 p-8 shadow-sm dark:bg-gray-900/80 dark:border-gray-800"
    >
      <!-- Brand / Title -->
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold tracking-tight">Todopro</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {{ isLogin ? "Sign in to manage your tasks" : "Create your account" }}
        </p>
      </div>

      <!-- Error -->
      <div
        v-if="errorMsg"
        class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ errorMsg }}
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 dark:bg-gray-950 dark:border-gray-800 dark:focus:ring-white/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 dark:bg-gray-950 dark:border-gray-800 dark:focus:ring-white/20"
            placeholder="••••••••"
          />
        </div>

        <button
          :disabled="loading"
          class="mt-2 w-full rounded-md border px-4 py-2 font-medium bg-black text-white border-black hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black dark:border-white"
        >
          {{
            loading
              ? isLogin
                ? "Signing in…"
                : "Signing up…"
              : isLogin
              ? "Sign in"
              : "Sign up"
          }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <button class="text-sm underline" @click="isLogin = !isLogin">
          {{
            isLogin ? "Need an account? Sign up" : "Have an account? Sign in"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHead, useNuxtApp, navigateTo } from "nuxt/app";

useHead({ title: "Todopro — Sign in" });

const { $supabase: supabase } = useNuxtApp() as any;

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");
const isLogin = ref(true);

onMounted(async () => {
  try {
    const { data } = await supabase?.auth?.getSession?.();
    if (data?.session) navigateTo("/");
  } catch {}
});

async function onSubmit() {
  errorMsg.value = "";
  loading.value = true;
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value,
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value,
      });
      if (error) throw error;
    }
    navigateTo("/");
  } catch (e: any) {
    errorMsg.value = e?.message || "Authentication failed";
  } finally {
    loading.value = false;
  }
}
</script>
