// import { defineStore } from "pinia";
// import { ref, computed } from "vue";
// import { useNuxtApp } from "nuxt/app";

// export type Todo = {
//   id: string;
//   title: string;
//   completed: boolean;
//   inserted_at: string;
//   user_id: string;
// };

// type Filter = "all" | "active" | "completed";
// type Sort = "newest" | "oldest";

// export const useTodosStore = defineStore("todos", () => {
//   const { $supabase: supabase } = useNuxtApp() as any;

//   // state
//   const items = ref<Todo[]>([]);
//   const loading = ref(false);

//   // search / filter / sort
//   const q = ref("");
//   const filter = ref<Filter>("all");
//   const sort = ref<Sort>("newest");

//   // pagination
//   const page = ref(1);
//   const perPage = ref(10);
//   const total = ref(0);
//   const pageCount = computed(() =>
//     Math.max(1, Math.ceil((total.value || 0) / perPage.value))
//   );
//   const hasPrev = computed(() => page.value > 1);
//   const hasNext = computed(() => page.value < pageCount.value);
//   const showingFrom = computed(() =>
//     items.value.length ? (page.value - 1) * perPage.value + 1 : 0
//   );
//   const showingTo = computed(() =>
//     items.value.length
//       ? (page.value - 1) * perPage.value + items.value.length
//       : 0
//   );

//   // realtime
//   let channel: any = null;
//   const realtimeReady = ref(false);

//   // helpers
//   function applyFilters(query: any) {
//     if (!query) return query;
//     // text search
//     const term = q.value.trim();
//     if (term) query = query.ilike("title", `%${term}%`);
//     // filter
//     if (filter.value === "active") query = query.eq("completed", false);
//     if (filter.value === "completed") query = query.eq("completed", true);
//     return query;
//   }

//   // ----- queries ------------------------------------------------------------
//   async function fetchTodos() {
//     if (!supabase) return;
//     loading.value = true;

//     const from = (page.value - 1) * perPage.value;
//     const to = from + perPage.value - 1;

//     let query = supabase.from("todos").select("*", { count: "exact" });

//     // sort
//     query = query.order("inserted_at", { ascending: sort.value === "oldest" });

//     // filters
//     query = applyFilters(query);

//     const { data, error, count } = await query.range(from, to);

//     loading.value = false;
//     if (error) {
//       console.error("[todos] fetchTodos error:", error);
//       items.value = [];
//       total.value = 0;
//       return;
//     }
//     items.value = (data || []) as Todo[];
//     total.value = count || 0;
//   }

//   function setSearch(val: string) {
//     q.value = val;
//   }
//   function setFilter(val: Filter) {
//     filter.value = val;
//   }
//   function setSort(val: Sort) {
//     sort.value = val;
//   }
//   function setPage(p: number) {
//     page.value = Math.min(Math.max(1, Math.trunc(p)), pageCount.value);
//   }

//   // ----- mutations ----------------------------------------------------------
//   async function addTodo(title: string) {
//     if (!supabase) return;
//     const t = title.trim();
//     if (!t) return;
//     const { error } = await supabase.from("todos").insert({ title: t });
//     if (error) console.error("[todos] addTodo error:", error);
//     // Realtime will refresh; if not enabled, fallback:
//     if (!realtimeReady.value) await fetchTodos();
//   }

//   async function toggleTodo(id: string, completed: boolean) {
//     if (!supabase) return;
//     const { error } = await supabase
//       .from("todos")
//       .update({ completed })
//       .eq("id", id);
//     if (error) console.error("[todos] toggleTodo error:", error);
//     if (!realtimeReady.value) await fetchTodos();
//   }

//   async function updateTitle(id: string, title: string) {
//     if (!supabase) return;
//     const t = title.trim();
//     if (!t) return;
//     const { error } = await supabase
//       .from("todos")
//       .update({ title: t })
//       .eq("id", id);
//     if (error) console.error("[todos] updateTitle error:", error);
//     if (!realtimeReady.value) await fetchTodos();
//   }

//   async function removeTodo(id: string) {
//     if (!supabase) return;
//     const { error } = await supabase.from("todos").delete().eq("id", id);
//     if (error) console.error("[todos] removeTodo error:", error);
//     if (!realtimeReady.value) await fetchTodos();
//   }

//   async function clearCompleted() {
//     if (!supabase) return;
//     const { error } = await supabase
//       .from("todos")
//       .delete()
//       .eq("completed", true);
//     if (error) console.error("[todos] clearCompleted error:", error);
//     if (!realtimeReady.value) await fetchTodos();
//   }

//   // ----- realtime -----------------------------------------------------------
//   function startRealtime() {
//     if (!supabase || channel) return;
//     channel = supabase
//       .channel("public:todos")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "todos" },
//         () => fetchTodos()
//       )
//       .on(
//         "postgres_changes",
//         { event: "UPDATE", schema: "public", table: "todos" },
//         () => fetchTodos()
//       )
//       .on(
//         "postgres_changes",
//         { event: "DELETE", schema: "public", table: "todos" },
//         () => fetchTodos()
//       )
//       .subscribe((status: string) => {
//         realtimeReady.value = status === "SUBSCRIBED";
//       });
//   }

//   async function stopRealtime() {
//     if (channel && supabase) {
//       await supabase.removeChannel(channel);
//       channel = null;
//       realtimeReady.value = false;
//     }
//   }

//   return {
//     // state
//     items,
//     loading,
//     q,
//     filter,
//     sort,
//     page,
//     perPage,
//     total,
//     pageCount,
//     hasPrev,
//     hasNext,
//     showingFrom,
//     showingTo,
//     realtimeReady,
//     // actions
//     fetchTodos,
//     setSearch,
//     setFilter,
//     setSort,
//     setPage,
//     addTodo,
//     toggleTodo,
//     updateTitle,
//     removeTodo,
//     clearCompleted,
//     startRealtime,
//     stopRealtime,
//   };
// });

// app/stores/todos.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useNuxtApp } from "nuxt/app";
import { useToast } from "../composables/useToast";

type Id = string | number;

export type Todo = {
  id: Id;
  title: string;
  completed: boolean;
  inserted_at: string;
  user_id: string;
};

type Filter = "all" | "active" | "completed";
type Sort = "newest" | "oldest";

export const useTodosStore = defineStore("todos", () => {
  const { $supabase: supabase } = useNuxtApp() as any;
  const toast = useToast();

  // state
  const items = ref<Todo[]>([]);
  const loading = ref(false);

  // search / filter / sort
  const q = ref("");
  const filter = ref<Filter>("all");
  const sort = ref<Sort>("newest");

  // pagination
  const page = ref(1);
  const perPage = ref(10);
  const total = ref(0);
  const pageCount = computed(() =>
    Math.max(1, Math.ceil((total.value || 0) / perPage.value))
  );
  const hasPrev = computed(() => page.value > 1);
  const hasNext = computed(() => page.value < pageCount.value);
  const showingFrom = computed(() =>
    items.value.length ? (page.value - 1) * perPage.value + 1 : 0
  );
  const showingTo = computed(
    () => (page.value - 1) * perPage.value + items.value.length
  );

  // realtime
  let channel: any = null;
  const realtimeReady = ref(false);

  // -------- helpers ---------------------------------------------------------
  const isTempId = (id: Id) => typeof id === "string" && id.startsWith("tmp_");
  function genTempId(): string {
    return `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  function sameId(a: Id, b: Id) {
    // compare loosely across string/number
    return String(a) === String(b);
  }
  function findIndex(id: Id) {
    return items.value.findIndex((t) => sameId(t.id, id));
  }
  function getAt(i: number): Todo | null {
    const t = items.value[i];
    return t ? (t as Todo) : null;
  }
  function insertLocal(t: Todo) {
    if (sort.value === "oldest") items.value.push(t);
    else items.value.unshift(t);
  }
  function replaceLocalId(tempId: Id, realId: Id) {
    const i = findIndex(tempId);
    if (i >= 0) items.value[i].id = realId;
  }
  function removeLocal(id: Id) {
    const i = findIndex(id);
    if (i >= 0) items.value.splice(i, 1);
  }
  function applyFilters(query: any) {
    if (!query) return query;
    const term = q.value.trim();
    if (term) query = query.ilike("title", `%${term}%`);
    if (filter.value === "active") query = query.eq("completed", false);
    if (filter.value === "completed") query = query.eq("completed", true);
    return query;
  }

  // -------- queries ----------------------------------------------------------
  async function fetchTodos() {
    if (!supabase) return;
    loading.value = true;

    const from = (page.value - 1) * perPage.value;
    const to = from + perPage.value - 1;

    let query = supabase
      .from("todos")
      .select("*", { count: "exact" })
      .order("inserted_at", { ascending: sort.value === "oldest" });

    query = applyFilters(query);
    const { data, error, count } = await query.range(from, to);

    loading.value = false;
    if (error) {
      console.error("[todos] fetchTodos error:", error);
      items.value = [];
      total.value = 0;
      return;
    }
    // bigint id comes back as number — our Id union handles it
    items.value = (data || []) as Todo[];
    total.value = count || 0;
  }

  function setSearch(val: string) {
    q.value = val;
  }
  function setFilter(val: Filter) {
    filter.value = val;
  }
  function setSort(val: Sort) {
    sort.value = val;
  }
  function setPage(p: number) {
    page.value = Math.min(Math.max(1, Math.trunc(p)), pageCount.value);
  }

  // -------- optimistic mutations --------------------------------------------
  async function addTodo(title: string) {
    if (!supabase) return;
    const t = title.trim();
    if (!t) return;

    const tempId = genTempId();
    const optimistic: Todo = {
      id: tempId,
      title: t,
      completed: false,
      inserted_at: new Date().toISOString(),
      user_id: "", // DB will fill
    };

    // optimistic add
    insertLocal(optimistic);
    total.value += 1;

    // Undo handler
    const undoId = toast.push("Todo added", {
      type: "success",
      actionLabel: "Undo",
      onAction: async () => {
        const idx = findIndex(tempId);
        const idForDelete = idx >= 0 ? items.value[idx].id : tempId;
        removeLocal(idForDelete);
        total.value = Math.max(0, total.value - 1);
        if (!isTempId(idForDelete)) {
          await supabase.from("todos").delete().eq("id", idForDelete);
        }
      },
    });

    // server (IMPORTANT: do NOT send id — let BIGINT autoincrement)
    const { data, error } = await supabase
      .from("todos")
      .insert({ title: t })
      .select("*")
      .single();

    if (error) {
      // rollback
      removeLocal(tempId);
      total.value = Math.max(0, total.value - 1);
      toast.remove(undoId);
      toast.push("Failed to add todo", { type: "error" });
      return;
    }

    // swap temp id → real id
    if (data?.id != null) {
      replaceLocalId(tempId, data.id as Id);
    }
    if (!realtimeReady.value) await fetchTodos();
  }

  async function toggleTodo(id: Id, completed: boolean) {
    if (!supabase) return;
    const i = findIndex(id);
    if (i < 0) return;
    const current = getAt(i);
    if (!current) return;
    const prev = { ...current };

    // optimistic toggle
    items.value[i] = { ...current, completed: !!completed };

    const undoId = toast.push(
      !!completed ? "Marked complete" : "Marked active",
      {
        type: "success",
        actionLabel: "Undo",
        onAction: async () => {
          const j = findIndex(id);
          const cur = j >= 0 ? getAt(j) : null;
          if (j >= 0 && cur)
            items.value[j] = { ...cur, completed: !!prev.completed };
          await supabase
            .from("todos")
            .update({ completed: !!prev.completed })
            .eq("id", id);
        },
      }
    );

    const { error } = await supabase
      .from("todos")
      .update({ completed: !!completed })
      .eq("id", id);
    if (error) {
      // rollback
      const j = findIndex(id);
      const cur = j >= 0 ? getAt(j) : null;
      if (j >= 0 && cur)
        items.value[j] = { ...cur, completed: !!prev.completed };
      toast.remove(undoId);
      toast.push("Failed to update", { type: "error" });
      return;
    }
    if (!realtimeReady.value) await fetchTodos();
  }

  async function updateTitle(id: Id, title: string) {
    if (!supabase) return;
    const t = title.trim();
    if (!t) return;

    const i = findIndex(id);
    if (i < 0) return;
    const current = getAt(i);
    if (!current) return;
    const prev = { ...current };

    // optimistic rename
    items.value[i] = { ...current, title: t };

    const undoId = toast.push("Renamed", {
      type: "success",
      actionLabel: "Undo",
      onAction: async () => {
        const j = findIndex(id);
        const cur = j >= 0 ? getAt(j) : null;
        if (j >= 0 && cur) items.value[j] = { ...cur, title: prev.title };
        await supabase.from("todos").update({ title: prev.title }).eq("id", id);
      },
    });

    const { error } = await supabase
      .from("todos")
      .update({ title: t })
      .eq("id", id);
    if (error) {
      // rollback
      const j = findIndex(id);
      const cur = j >= 0 ? getAt(j) : null;
      if (j >= 0 && cur) items.value[j] = { ...cur, title: prev.title };
      toast.remove(undoId);
      toast.push("Failed to rename", { type: "error" });
      return;
    }
    if (!realtimeReady.value) await fetchTodos();
  }

  async function removeTodo(id: Id) {
    if (!supabase) return;
    const i = findIndex(id);
    if (i < 0) return;
    const cur = getAt(i);
    if (!cur) return;
    const snapshot = { ...cur };

    // optimistic remove
    removeLocal(id);
    total.value = Math.max(0, total.value - 1);

    const undoId = toast.push("Deleted", {
      type: "success",
      actionLabel: "Undo",
      onAction: async () => {
        insertLocal(snapshot);
        total.value += 1;
        // If snapshot had a real DB id, re-insert with that id will fail on BIGINT PK
        // so let DB generate a new id, but keep the same fields
        await supabase.from("todos").insert({
          title: snapshot.title,
          completed: !!snapshot.completed,
        });
      },
    });

    // If id is still temporary, there is nothing to delete from DB
    if (isTempId(id)) return;

    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      // rollback
      insertLocal(snapshot);
      total.value += 1;
      toast.remove(undoId);
      toast.push("Failed to delete", { type: "error" });
      return;
    }
    if (!realtimeReady.value) await fetchTodos();
  }

  async function clearCompleted() {
    if (!supabase) return;
    const done = items.value.filter((t) => !!t.completed);
    if (!done.length) return;

    // optimistic
    const removed = new Map(done.map((t) => [String(t.id), t]));
    items.value = items.value.filter((t) => !removed.has(String(t.id)));
    total.value = Math.max(0, total.value - done.length);

    const undoId = toast.push(`Cleared ${done.length} completed`, {
      type: "success",
      actionLabel: "Undo",
      onAction: async () => {
        for (const t of done) {
          insertLocal(t);
          total.value += 1;
          await supabase.from("todos").insert({
            title: t.title,
            completed: !!t.completed,
          });
        }
      },
    });

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("completed", true);
    if (error) {
      // rollback
      for (const t of done) insertLocal(t);
      total.value += done.length;
      toast.remove(undoId);
      toast.push("Failed to clear completed", { type: "error" });
      return;
    }
    if (!realtimeReady.value) await fetchTodos();
  }

  // -------- realtime ---------------------------------------------------------
  function startRealtime() {
    if (!supabase || channel) return;
    channel = supabase
      .channel("public:todos")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "todos" },
        () => fetchTodos()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "todos" },
        () => fetchTodos()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "todos" },
        () => fetchTodos()
      )
      .subscribe((status: string) => {
        realtimeReady.value = status === "SUBSCRIBED";
      });
  }

  async function stopRealtime() {
    if (channel && supabase) {
      await supabase.removeChannel(channel);
      channel = null;
      realtimeReady.value = false;
    }
  }

  return {
    // state
    items,
    loading,
    q,
    filter,
    sort,
    page,
    perPage,
    total,
    pageCount,
    hasPrev,
    hasNext,
    showingFrom,
    showingTo,
    realtimeReady,
    // actions
    fetchTodos,
    setSearch,
    setFilter,
    setSort,
    setPage,
    addTodo,
    toggleTodo,
    updateTitle,
    removeTodo,
    clearCompleted,
    startRealtime,
    stopRealtime,
  };
});
