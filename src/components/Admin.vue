<template>
  <div class="admin-container">
    <h1>Admin Panel</h1>
    <div class="task-list">
      <div v-for="(task, index) in tasks" :key="index">
        <input v-model="tasks[index]" />
        <!-- <input v-model="taskData[tasks[index]]" /> -->
        <button class="danger-button" @click="removeTask(index)">-</button>
      </div>
      <div>
        <button @click="addTask()">+</button>
      </div>
    </div>
    <div>
      <router-link to="/"><button>Home</button></router-link>
      <button @click="saveTasks">Save</button>
    </div>
    <div>
      <button class="danger-button" @click="resetTimers">Reset Timers</button>
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
  text-align: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}
.task-list {
  margin: 20px 0;
}
input {
  width: 200px;
  padding: 5px;
  margin-bottom: 10px;
}
button {
  background: #34A853;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  margin: 5px;
}

.danger-button {
  background: red;
}
</style>

