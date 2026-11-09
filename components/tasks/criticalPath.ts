import type { WorkItem } from "@/lib/api/types";
import dayjs from "@/lib/dayjs";

/**
 * Critical path on a date-based plan: the chain of items with no slack that
 * ends at the latest finish date. Delaying any of them delays the project.
 * Returns the critical item ids and edges ("predecessor>item").
 */
export function computeCriticalPath(items: WorkItem[]) {
  const scheduled = items.filter((i) => i.dueDate);
  const byId = new Map(scheduled.map((i) => [i.id, i]));
  const successors = new Map<string, WorkItem[]>();
  for (const item of scheduled) {
    for (const pre of item.dependsOn) {
      if (byId.has(pre)) successors.set(pre, [...(successors.get(pre) ?? []), item]);
    }
  }

  const ids = new Set<string>();
  const edges = new Set<string>();
  if (scheduled.length === 0) return { ids, edges };

  const projectEnd = scheduled.reduce((max, i) => (i.dueDate! > max ? i.dueDate! : max), scheduled[0].dueDate!);
  const startOf = (i: WorkItem) => i.startDate ?? i.dueDate!;
  const memo = new Map<string, boolean>();

  function isCritical(item: WorkItem): boolean {
    if (memo.has(item.id)) return memo.get(item.id)!;
    memo.set(item.id, false); // guard against bad data loops
    const next = successors.get(item.id) ?? [];
    let critical: boolean;
    if (next.length === 0) {
      critical = item.dueDate === projectEnd;
    } else {
      const tight = next.filter((s) => dayjs(startOf(s)).diff(dayjs(item.dueDate!), "day") <= 1 && isCritical(s));
      tight.forEach((s) => edges.add(`${item.id}>${s.id}`));
      critical = tight.length > 0;
    }
    memo.set(item.id, critical);
    if (critical) ids.add(item.id);
    return critical;
  }

  scheduled.forEach(isCritical);
  // Keep only edges between critical items.
  for (const e of [...edges]) {
    const [a, b] = e.split(">");
    if (!ids.has(a) || !ids.has(b)) edges.delete(e);
  }
  return { ids, edges };
}
