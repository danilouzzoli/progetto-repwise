"use client";

import { useEffect, useState } from "react";

type Workout = {
  id: string;
  name: string;
  days: number[]; // 0 = Lunedì ... 6 = Domenica
  completedDates: string[];
};

const STORAGE_KEY = "habit-tracker:workouts";
const DAYS = [
  "Lun",
  "Mar",
  "Mer",
  "Gio",
  "Ven",
  "Sab",
  "Dom",
];
const DAYS_FULL = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function todayDayIndex() {
  // 0 = Lunedì ... 6 = Domenica
  return (new Date().getDay() + 6) % 7;
}

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [input, setInput] = useState("");
  const [today, setToday] = useState("");
  const [todayDay, setTodayDay] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setToday(todayKey());
    setTodayDay(todayDayIndex());
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Workout> & { day?: number };
        const arr = Array.isArray(parsed) ? parsed : [];
        setWorkouts(
          arr.map((w) => {
            let days: number[] = [];
            if (Array.isArray(w.days)) days = (w.days as unknown[]).filter((n): n is number => typeof n === "number");
            else if (typeof w.day === "number") days = [w.day];
            return {
              id: w.id ?? crypto.randomUUID(),
              name: w.name ?? "",
              days,
              completedDates: Array.isArray(w.completedDates)
                ? w.completedDates
                : [],
            };
          })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    }
  }, [workouts, mounted]);

  const todayWorkouts = workouts.filter((w) => w.days.includes(todayDay));
  const completedCount = todayWorkouts.filter((w) =>
    w.completedDates.includes(today)
  ).length;

  function addWorkout(e: React.FormEvent) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    setWorkouts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, days: [], completedDates: [] },
    ]);
    setInput("");
  }

  function toggleDay(workoutId: string, d: number) {
    setWorkouts((prev) =>
      prev.map((w) => {
        if (w.id !== workoutId) return w;
        const has = w.days.includes(d);
        return {
          ...w,
          days: has ? w.days.filter((x) => x !== d) : [...w.days, d],
        };
      })
    );
  }

  function toggleToday(id: string) {
    setWorkouts((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const done = w.completedDates.includes(today);
        return {
          ...w,
          completedDates: done
            ? w.completedDates.filter((d) => d !== today)
            : [...w.completedDates, today],
        };
      })
    );
  }

  function removeWorkout(id: string) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {mounted
              ? `${completedCount} of ${todayWorkouts.length} allenamenti di oggi (${DAYS_FULL[todayDay]})`
              : "Loading..."}
          </p>
        </header>

        <form onSubmit={addWorkout} className="mb-6 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nuovo allenamento..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
          >
            Aggiungi
          </button>
        </form>

        <ul className="space-y-3">
          {workouts.map((w) => {
            const done = w.completedDates.includes(today);
            const isToday = w.days.includes(todayDay);
            return (
              <li
                key={w.id}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleToday(w.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        done
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span
                      className={`text-sm ${
                        done ? "line-through text-zinc-400" : ""
                      }`}
                    >
                      {w.name}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {w.days.length}
                    </span>
                    <button
                      onClick={() => removeWorkout(w.id)}
                      className="text-xs text-zinc-400 hover:text-red-500"
                      aria-label="Delete workout"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {DAYS.map((label, i) => {
                    const selected = w.days.includes(i);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleDay(w.id, i)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        } ${isToday && i === todayDay ? "ring-2 ring-green-500" : ""}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>

        {mounted && workouts.length === 0 && (
          <p className="mt-8 text-center text-sm text-zinc-400">
            Nessun allenamento. Aggiungine uno sopra.
          </p>
        )}
      </main>
    </div>
  );
}