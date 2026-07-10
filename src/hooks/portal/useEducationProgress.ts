import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "f4a-education-progress";

function readProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

let cache = readProgress();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cache;
}

export function useEducationProgress() {
  const completed = useSyncExternalStore(subscribe, getSnapshot, () => new Set<string>());

  const toggleLesson = useCallback((lessonId: string) => {
    const next = new Set(cache);
    if (next.has(lessonId)) next.delete(lessonId);
    else next.add(lessonId);
    cache = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    emit();
  }, []);

  const isLessonComplete = useCallback((lessonId: string) => completed.has(lessonId), [completed]);

  const totalLessons = useCallback(
    (lessonIds: string[]) => lessonIds.filter((id) => completed.has(id)).length,
    [completed],
  );

  return { completed, toggleLesson, isLessonComplete, totalLessons };
}
