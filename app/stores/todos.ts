// app/stores/todos.ts
import { defineStore } from "pinia";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useNuxtApp } from "nuxt/app";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  inserted_at: string;
  user_id: string;
};

type Filter = "all" | "active" | "completed";
type Sort = "newest" | "oldest";

export const useTodosStore = defineStore("todos", () => {
  const { $supabase: supabase } = useNuxtApp() as any;

  // data
  const items = ref<Todo[]>([]);
  const loading = ref(false);

  // query params
  const q = ref<string>(""); // search query
  const filter = ref<Filter>("all"); // status filter
  const sort = ref<Sort>("newest"); // date sort

  // pagination (fixed 10/page)
  const page = ref(1);
  const pageSize = ref(10); // <- fixed to 10
  const total = ref(0);

  const pageCount = computed(() =>
    Math.max(1, Math.ceil((total.value || 0) / pageSize.value))
  );
  const hasPrev = computed(() => page.value > 1);
  const hasNext = computed(() => page.value < pageCount.value);
  const showingFrom = computed(() =>
    total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1
  );
  const showingTo = computed(() =>
    Math.min(page.value * pageSize.value, total.value)
  );

  let channel: any | null = null;

  const fetchTodos = async () => {
    if (!supabase) return;
    loading.value = true;

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;

    let req = supabase
      .from("todos")
      .select("*", { count: "exact" })
      .order("inserted_at", { ascending: sort.value === "oldest" });

    if (userId) req = req.eq("user_id", userId);
    if (q.value.trim()) req = req.ilike("title", `%${q.value.trim()}%`);
    if (filter.value === "active") req = req.eq("completed", false);
    if (filter.value === "completed") req = req.eq("completed", true);

    const from = (page.value - 1) * pageSize.value;
    const to = from + pageSize.value - 1;
    req = req.range(from, to);

    const { data, count, error } = await req;
    loading.value = false;
    if (error) throw error;

    items.value = (data ?? []) as Todo[];
    total.value = count ?? 0;
  };

  const addTodo = async (title: string) => {
    if (!supabase) return;
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;
    const { error } = await supabase
      .from("todos")
      .insert({ title, user_id: userId });
    if (error) throw error;
    await fetchTodos();
  };

  const updateTitle = async (id: string, title: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("todos")
      .update({ title })
      .eq("id", id);
    if (error) throw error;
    await fetchTodos();
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("todos")
      .update({ completed })
      .eq("id", id);
    if (error) throw error;
    await fetchTodos();
  };

  const removeTodo = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) throw error;
    if (items.value.length === 1 && page.value > 1) page.value -= 1;
    await fetchTodos();
  };

  const clearCompleted = async () => {
    if (!supabase) return;
    const ids = items.value.filter((t) => t.completed).map((t) => t.id);
    if (!ids.length) return;
    const { error } = await supabase.from("todos").delete().in("id", ids);
    if (error) throw error;
    if (items.value.length === ids.length && page.value > 1) page.value -= 1;
    await fetchTodos();
  };

  // Realtime: refetch current page on any change
  const startRealtime = () => {
    if (!supabase || channel) return;
    channel = supabase
      .channel("public:todos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => fetchTodos()
      )
      .subscribe();
  };
  const stopRealtime = () => {
    channel?.unsubscribe?.();
    channel = null;
  };

  // setters
  const setSearch = (val: string) => {
    q.value = val;
    page.value = 1;
  };
  const setFilter = (val: Filter) => {
    filter.value = val;
    page.value = 1;
  };
  const setSort = (val: Sort) => {
    sort.value = val;
    page.value = 1;
  };
  const setPage = (p: number) => {
    page.value = Math.max(1, p);
  };

  onMounted(startRealtime);
  onBeforeUnmount(stopRealtime);

  return {
    // data
    items,
    loading,
    // query state
    q,
    filter,
    sort,
    page,
    pageSize,
    total,
    pageCount,
    hasPrev,
    hasNext,
    showingFrom,
    showingTo,
    // actions
    fetchTodos,
    addTodo,
    updateTitle,
    toggleTodo,
    removeTodo,
    clearCompleted,
    // setters
    setSearch,
    setFilter,
    setSort,
    setPage,
    // realtime (optional)
    startRealtime,
    stopRealtime,
  };
});
