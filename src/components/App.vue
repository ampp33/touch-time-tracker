<template>
  <div class="container">
    <router-link to="/admin"><button class="admin-btn">Admin</button></router-link>
    <div class="grid">
      <button 
        v-for="task in tasks" 
        :key="task" 
        @click="toggleTask(task)"
        @dblclick="resetTaskTime(task)"
        :class="{ active: activeTask === task }"
      >
        <b>{{ task }}</b><br>{{ formatTime(taskTimes[task] || 0) }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: JSON.parse(localStorage.getItem("tasks")) || ["Meetings", "Project A", "Project B", "Lunch", "Break", "Misc"],
      taskTimes: JSON.parse(localStorage.getItem("taskTimes")) || {},
      activeTask: null,
      timer: null,
    };
  },
  methods: {
    toggleTask(task) {
      if (this.activeTask) {
        clearInterval(this.timer);
      }

      this.activeTask = task;
      if (!this.taskTimes[task]) {
        this.taskTimes[task] = 0;
      }

      this.timer = setInterval(() => {
        this.taskTimes[task]++;
        localStorage.setItem("taskTimes", JSON.stringify(this.taskTimes));
      }, 1000);
    },
    resetTaskTime(task) {
      // stop timer if this task is currently active
      if (this.activeTask == task) {
        this.activeTask = null
        clearInterval(this.timer)
      }
      // set task's time to 0
      this.taskTimes[task] = 0
      // write to local storage
      localStorage.setItem("taskTimes", JSON.stringify(this.taskTimes))
    },
    formatTime(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h}h ${m}m ${s}s`;
    },
    showReport() {
      alert(
        Object.entries(this.taskTimes)
          .map(([task, time]) => `${task}: ${this.formatTime(time)}`)
          .join("\n")
      );
    }
  },
  beforeUnmount() {
    clearInterval(this.timer);
  }
};
</script>

<style>
  body {
    margin: 10px;
  }
</style>

<style scoped>
.container {
  text-align: center;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  height: calc(100vh - 130px);
}
button {
  width: 100%;
  height: 100%;
  font-size: 24px;
  background: #4285F4;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}
button:hover {
  background: #357ae8;
}
button.active {
  background: #34A853;
}
.admin-btn {
  height: 100px;
  margin-bottom: 10px;
  background: #F4B400;
}
</style>
