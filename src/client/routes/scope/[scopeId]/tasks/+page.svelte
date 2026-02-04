<script lang="ts">
  import type { TaskGroup } from "$lib/types";

  let { data } = $props();
  let groups = $derived((data.taskGroups as TaskGroup[]).filter((g) => g.tasks.length > 0));
</script>

<div class="animate-in">
  <h2>Tasks</h2>

  {#if groups.length === 0}
    <div class="empty-state">タスクがありません</div>
  {:else}
    {#each groups as group}
      <div class="task-group">
        <div class="group-header">
          {#if group.project}
            <span class="group-project">{group.project}</span>
          {/if}
          <span class="group-progress">{group.completed}/{group.total}</span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width: {group.total > 0 ? (group.completed / group.total) * 100 : 0}%"
            ></div>
          </div>
        </div>
        <div class="task-list">
          {#each group.tasks as task}
            <div class="task-item" class:completed={task.status === "completed"}>
              <span class="task-status" class:done={task.status === "completed"} class:active={task.status === "in_progress"}>
                {#if task.status === "completed"}
                  &#x2713;
                {:else if task.status === "in_progress"}
                  &#x25B6;
                {:else}
                  &#x25CB;
                {/if}
              </span>
              <div class="task-content">
                <div class="task-subject">{task.subject}</div>
                {#if task.description}
                  <div class="task-desc">{task.description}</div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  h2 { font-size: 20px; font-weight: 600; margin-bottom: 24px; }
  .empty-state { padding: 32px; text-align: center; color: var(--text-tertiary); }

  .task-group {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
  }
  .group-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg);
    border-bottom: 1px solid var(--border-light);
  }
  .group-project {
    font-size: 12px;
    font-family: var(--font-code);
    color: var(--text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .group-progress {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
  }
  .progress-bar {
    flex: 1;
    height: 6px;
    background: var(--border-light);
    border-radius: 3px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--success);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .task-list { padding: 4px 0; }
  .task-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 16px;
  }
  .task-item.completed { opacity: 0.6; }
  .task-status {
    flex-shrink: 0;
    width: 18px;
    text-align: center;
    font-size: 13px;
    color: var(--text-tertiary);
    margin-top: 1px;
  }
  .task-status.done { color: var(--success); }
  .task-status.active { color: var(--coral); }
  .task-subject { font-size: 14px; color: var(--text); }
  .task-desc { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

  .animate-in { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
