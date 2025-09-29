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
<template>
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
</script>
