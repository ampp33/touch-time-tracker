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
        <b>{{ task }}</b><br>{{ formatTime(task) }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: JSON.parse(localStorage.getItem("tasks")) || ["Meetings", "Project A", "Project B", "Lunch", "Break", "Misc"],
      taskData: JSON.parse(localStorage.getItem("taskData")) || {},
      activeTask: null,
      taskTemplate: {
        start_ts: null,
        total_time: 0
      }
    };
  },
  methods: {
    toggleTask(task) {
      // stop the active task no matter what
      if (this.activeTask) {
        const activeTaskObj = this.taskData[this.activeTask]
        activeTaskObj.total_time += Math.floor((new Date().getTime() - activeTaskObj.start_ts) / 1000)
        this.activeTask = null
      }
      
      // if the task clicked wasn't the active task then start the task
      if(this.activeTask != task) {
        if(!this.taskData[task]) this.taskData[task] = JSON.parse(JSON.stringify(this.taskTemplate))
        const taskObj = this.taskData[task]
        taskObj.start_ts = new Date().getTime()
        this.activeTask = task
      }

      localStorage.setItem("taskData", JSON.stringify(this.taskData))
    },
    resetTaskTime(task) {
      const taskObj = this.taskData[task]
      taskObj.start_ts = 0
      taskObj.total_time = 0

      localStorage.setItem("taskData", JSON.stringify(this.taskData));
    },
    formatTime(task) {
      let totalSeconds = 0
      const taskObj = this.taskData[task]

      if (taskObj) {
        const now = new Date().getTime()
        const startTs = taskObj.start_ts
        const endTs = startTs != 0 ? now : 0
        totalSeconds = taskObj.total_time + Math.floor((endTs - startTs) / 1000)
      }

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${h}h ${m}m ${s}s`;
    },
    showReport() {
      alert(
        Object.entries(this.taskTimes)
          .map(([task, time]) => `${task}: ${this.formatTime(time)}`)
          .join("\n")
      );
    }
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
