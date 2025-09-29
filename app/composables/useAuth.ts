import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useNuxtApp, navigateTo } from "nuxt/app";

type Sub = { unsubscribe: () => void } | undefined;
const user = ref<any>(null);

export function useAuth() {
  const { $supabase: supabase } = useNuxtApp() as any;
  let sub: Sub;

  const refresh = async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    user.value = data.user ?? null;
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await refresh();
    navigateTo("/");
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    user.value = null;
    navigateTo("/login");
  };

  onMounted(async () => {
    await refresh();
    if (supabase) {
      sub = supabase.auth.onAuthStateChange((_e: any, session: any) => {
        user.value = session?.user ?? null;
      }).data.subscription;
    }
  });
  onBeforeUnmount(() => sub?.unsubscribe?.());

  return {
    user,
    isAuthed: computed(() => !!user.value),
    signIn,
    signUp,
    signOut,
    refresh,
  };
}
