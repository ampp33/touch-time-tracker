<template>
  <div class="container">
    <header class="header">
      <div class="total">
        <span class="total-label">Total time</span>
        <span class="total-value">{{ totalTime(tick) }}</span>
      </div>
      <router-link to="/admin" class="admin-btn" aria-label="Admin">⚙</router-link>
    </header>

    <div class="grid">
      <div
        v-for="task in tasks"
        :key="task"
        class="task"
        role="button"
        tabindex="0"
        :aria-pressed="activeTask === task"
        :class="{ active: activeTask === task, editing: editingTask === task }"
        @pointerdown="onPointerDown(task, $event)"
        @pointermove="onPointerMove($event)"
        @pointerup="onPointerUp(task)"
        @pointerleave="onPointerLeave"
        @pointercancel="onPointerLeave"
        @contextmenu.prevent
        @keydown.enter.prevent="toggleTask(task)"
        @keydown.space.prevent="toggleTask(task)"
      >
        <template v-if="editingTask === task">
          <input
            ref="renameInput"
            v-model="editingText"
            class="rename-input"
            @click.stop
            @pointerdown.stop
            @pointerup.stop
            @keyup.enter="confirmRename"
            @keyup.esc="cancelRename"
            @blur="confirmRename"
          />
        </template>
        <template v-else>
          <span v-if="activeTask === task" class="pulse"></span>
          <b class="task-name">{{ task }}</b>
          <span class="task-time">{{ formatTime(task, tick) }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
const LONG_PRESS_MS = 550;
const DOUBLE_TAP_MS = 300;
const MOVE_THRESHOLD = 12;

export default {
  data() {
    return {
      tasks: JSON.parse(localStorage.getItem("tasks")) || ["Meetings", "Project A", "Project B", "Lunch", "Break", "Misc"],
      taskData: JSON.parse(localStorage.getItem("taskData")) || {},
      tick: 0,
      activeTask: localStorage.getItem("activeTask") || null,
      taskTemplate: {
        start_ts: null,
        total_time: 0
      },
      editingTask: null,
      editingText: "",
      longPressTimer: null,
      longPressTriggered: false,
      pendingTapTimeout: null,
      lastTapTime: {},
      pointerStartX: 0,
      pointerStartY: 0
    };
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.tick++
    }, 1000)
  },
  unmounted() {
    clearInterval(this.intervalId)
    clearTimeout(this.longPressTimer)
    clearTimeout(this.pendingTapTimeout)
  },
  methods: {
    onPointerDown(task, e) {
      if (this.editingTask) return
      this.longPressTriggered = false
      this.pointerStartX = e.clientX
      this.pointerStartY = e.clientY
      clearTimeout(this.longPressTimer)
      this.longPressTimer = setTimeout(() => {
        this.longPressTriggered = true
        this.startRename(task)
      }, LONG_PRESS_MS)
    },
    onPointerMove(e) {
      if (!this.longPressTimer) return
      const dx = e.clientX - this.pointerStartX
      const dy = e.clientY - this.pointerStartY
      if (Math.hypot(dx, dy) > MOVE_THRESHOLD) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    },
    onPointerLeave() {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    },
    onPointerUp(task) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null

      if (this.longPressTriggered) {
        this.longPressTriggered = false
        return
      }

      const now = Date.now()
      const lastTap = this.lastTapTime[task] || 0
      this.lastTapTime[task] = now

      if (now - lastTap < DOUBLE_TAP_MS) {
        clearTimeout(this.pendingTapTimeout)
        this.pendingTapTimeout = null
        this.lastTapTime[task] = 0
        this.resetTaskTime(task)
        return
      }

      clearTimeout(this.pendingTapTimeout)
      this.pendingTapTimeout = setTimeout(() => {
        this.toggleTask(task)
      }, DOUBLE_TAP_MS)
    },
    startRename(task) {
      clearTimeout(this.pendingTapTimeout)
      this.editingTask = task
      this.editingText = task
      this.$nextTick(() => {
        const el = this.$refs.renameInput
        const input = Array.isArray(el) ? el[0] : el
        if (input) {
          input.focus()
          input.select()
        }
      })
    },
    confirmRename() {
      if (this.editingTask === null) return
      const oldName = this.editingTask
      const newName = this.editingText.trim()
      this.editingTask = null

      if (!newName || newName === oldName) return
      if (this.tasks.includes(newName)) {
        alert("A task with that name already exists.")
        return
      }

      const idx = this.tasks.indexOf(oldName)
      if (idx !== -1) this.tasks.splice(idx, 1, newName)

      if (this.taskData[oldName]) {
        this.taskData[newName] = this.taskData[oldName]
        delete this.taskData[oldName]
      }
      if (this.activeTask === oldName) this.activeTask = newName

      localStorage.setItem("tasks", JSON.stringify(this.tasks))
      localStorage.setItem("taskData", JSON.stringify(this.taskData))
      if (this.activeTask) localStorage.setItem("activeTask", this.activeTask)
    },
    cancelRename() {
      this.editingTask = null
    },
    toggleTask(task) {
      // check if the task clicked is the current active task
      const activeTaskWasClicked = this.activeTask == task

      // whatever task was running, turn it off
      if (this.activeTask) {
        const activeTaskObj = this.taskData[this.activeTask]
        if (activeTaskObj.start_ts > 0) activeTaskObj.total_time += Math.floor((new Date().getTime() - activeTaskObj.start_ts) / 1000)
        activeTaskObj.start_ts = 0
        this.activeTask = null
      }

      // if the task that was selected was not active then start it up
      if (!activeTaskWasClicked) {
        if (!this.taskData[task]) this.taskData[task] = JSON.parse(JSON.stringify(this.taskTemplate))
        const taskObj = this.taskData[task]
        taskObj.start_ts = new Date().getTime()
        this.activeTask = task
      }

      localStorage.setItem("taskData", JSON.stringify(this.taskData))
      if (this.activeTask) {
        localStorage.setItem("activeTask", this.activeTask)
      } else {
        localStorage.removeItem("activeTask")
      }
    },
    resetTaskTime(task) {
      if (!this.taskData[task]) return
      const taskObj = this.taskData[task]
      taskObj.start_ts = 0
      taskObj.total_time = 0

      if (this.activeTask === task) {
        this.activeTask = null
        localStorage.removeItem("activeTask")
      }

      localStorage.setItem("taskData", JSON.stringify(this.taskData))
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
        if (c) {
          if (c.start_ts != 0) return t + (c.total_time + Math.floor((new Date().getTime() - c.start_ts) / 1000))
          return t + c.total_time
        }
        return t
      }, 0))
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  height: 100vh;
  padding: 16px;
  gap: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 16px 20px;
}

.total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.total-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.total-value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.admin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  font-size: 20px;
  text-decoration: none;
  border: 1px solid var(--color-border);
  transition: background 0.2s, color 0.2s;
}

.admin-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  min-height: 0;
}

.task {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  transition: background 0.15s, border-color 0.15s, transform 0.1s, color 0.15s;
}

.task:active {
  transform: scale(0.97);
}

.task-name {
  font-size: 17px;
  font-weight: 600;
}

.task-time {
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.task.active {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
  color: var(--color-accent-contrast);
}

.task.active .task-time {
  color: var(--color-accent-contrast);
}

.task.editing {
  background: var(--color-accent-2-soft);
  border-color: var(--color-accent-2);
  border-style: dashed;
}

.pulse {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.6);
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(37, 99, 235, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
  }
}

.rename-input {
  width: 85%;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  padding: 6px 8px;
  border: 1px solid var(--color-accent-2);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
}

.rename-input:focus {
  outline: none;
}
</style>
