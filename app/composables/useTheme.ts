import { ref, onMounted } from "vue";

export function useTheme() {
  const isDark = ref(false);

  const apply = (val: boolean) => {
    const root = document.documentElement;
    root.classList.toggle("dark", val); // Tailwind dark: now follows this
    root.style.colorScheme = val ? "dark" : "light"; // better form controls/colors
  };

  const set = (mode: "light" | "dark" | "system") => {
    if (mode === "system") {
      localStorage.removeItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      isDark.value = prefersDark;
      apply(prefersDark);
      return;
    }
    localStorage.setItem("theme", mode);
    isDark.value = mode === "dark";
    apply(isDark.value);
  };

  const toggle = () => set(isDark.value ? "light" : "dark");

  onMounted(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    isDark.value = saved ? saved === "dark" : prefersDark;
    apply(isDark.value);

    // keep in sync with OS when user hasn’t chosen a preference
    if (!saved) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        isDark.value = e.matches;
        apply(isDark.value);
      };
      mq.addEventListener("change", handler);
    }
  });

  return { isDark, toggle, set };
}
