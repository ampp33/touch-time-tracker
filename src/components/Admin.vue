<template>
  <div class="admin-container">
    <h1>Admin</h1>
    <div class="task-list">
      <div class="task-row" v-for="(_, index) in tasks" :key="index">
        <input v-model="tasks[index]" />
        <button class="danger-button" @click="removeTask(index)" aria-label="Remove task">−</button>
      </div>
      <button class="add-button" @click="addTask()">+ Add task</button>
    </div>
    <div class="actions">
      <router-link to="/"><button class="secondary-button">Home</button></router-link>
      <button class="primary-button" @click="saveTasks">Save</button>
    </div>
    <div class="actions">
      <button class="danger-button-full" @click="resetTimers">Reset all timers</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: JSON.parse(localStorage.getItem("tasks")) || ["Meetings", "Project A", "Project B", "Lunch", "Break", "Misc"],
      taskData: JSON.parse(localStorage.getItem("taskData")) || {}
    };
  },
  methods: {
    addTask() {
      this.tasks.push('')
    },
    removeTask(index) {
      if(localStorage.getItem("activeTask") == this.tasks[index]) localStorage.removeItem("activeTask")
      this.tasks.splice(index, 1)
    },
    saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(this.tasks));
      alert("Tasks updated!");
    },
    resetTimers() {
      const taskData = JSON.parse(localStorage.getItem("taskData"))
      for(const task in taskData) {
        taskData[task].start_ts = 0
        taskData[task].total_time = 0
      }
      localStorage.setItem("taskData", JSON.stringify(taskData))
      localStorage.removeItem("activeTask")
    },
    formatTimeString(totalSeconds) {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${h}h ${m}m ${s}s`;
    },
  }
};
</script>

<style scoped>
.admin-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px;
  color: var(--color-text);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.task-row {
  display: flex;
  gap: 8px;
}

input {
  flex: 1;
  padding: 10px 12px;
  font-size: 15px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
}

input:focus {
  outline: none;
  border-color: var(--color-accent);
}

button {
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.danger-button {
  width: 40px;
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-size: 18px;
}

.danger-button:hover {
  opacity: 0.8;
}

.add-button {
  padding: 10px;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border);
}

.add-button:hover {
  background: var(--color-border);
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.actions > a {
  text-decoration: none;
  flex: 1;
}

.primary-button {
  flex: 1;
  padding: 12px;
  background: var(--color-accent);
  color: white;
}

.primary-button:hover {
  background: var(--color-accent-contrast);
}

.secondary-button {
  width: 100%;
  padding: 12px;
  background: var(--color-surface-hover);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.secondary-button:hover {
  background: var(--color-border);
}

.danger-button-full {
  width: 100%;
  padding: 12px;
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.danger-button-full:hover {
  opacity: 0.8;
}
</style>
