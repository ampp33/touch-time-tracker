<template>
  <div class="container">
    <router-link to="/admin"><button class="admin-btn">Admin - {{ totalTime(tick) }}</button></router-link>
    <div class="grid">
      <button 
        v-for="task in tasks" 
        :key="task" 
        @click="toggleTask(task)"
        @dblclick="resetTaskTime(task)"
        :class="{ active: activeTask === task }"
      >
        <b>{{ task }}</b><br>{{ formatTime(task, tick) }}
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
      tick: 0,
      activeTask: localStorage.getItem("activeTask"),
      taskTemplate: {
        start_ts: null,
        total_time: 0
      }
    };
  },
  mounted() {
    setInterval(() => {
        this.tick++
    }, 1000)
  },
  methods: {
    toggleTask(task, tick) {
      // check if the task clicked is the current active task
      const activeTaskWasClicked = this.activeTask == task

      // whatever task was running, turn it off
      if (this.activeTask) {
        const activeTaskObj = this.taskData[this.activeTask]
        if(activeTaskObj.start_ts > 0) activeTaskObj.total_time += Math.floor((new Date().getTime() - activeTaskObj.start_ts) / 1000)
        activeTaskObj.start_ts = 0
        this.activeTask = null
      }
      
      // if the task that was selected was not active then start it up
      if(!activeTaskWasClicked) {
        if(!this.taskData[task]) this.taskData[task] = JSON.parse(JSON.stringify(this.taskTemplate))
        const taskObj = this.taskData[task]
        taskObj.start_ts = new Date().getTime()
        this.activeTask = task
      }

      localStorage.setItem("taskData", JSON.stringify(this.taskData))
      localStorage.setItem("activeTask", this.activeTask)
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

      return this.formatTimeString(totalSeconds)
    },
    formatTimeString(totalSeconds) {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${h}h ${m}m ${s}s`;
    },
    totalTime(tick) {
      return this.formatTimeString(this.tasks.map(task => this.taskData[task]).reduce((t, c) => {
        if(c) {
          if(c.start_ts != 0) return t + (c.total_time + Math.floor((new Date().getTime() - c.start_ts) / 1000))
          return t + c.total_time
        }
        return 0
      }, 0))
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
  /*
  grid-template-rows: repeat(3, 1fr);
  */
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
