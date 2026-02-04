import { fetchTasks } from "$lib/api";

export async function load() {
  const taskGroups = await fetchTasks();
  return { taskGroups };
}
