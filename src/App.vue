<script setup lang="ts">
</script>

<template>
  <router-view />
</template>

<style>
:root {
  --color-bg: #f4f4f5;
  --color-surface: #ffffff;
  --color-surface-hover: #ececee;
  --color-border: #e2e2e5;
  --color-text: #18181b;
  --color-text-muted: #71717a;

  --color-accent: #2563eb;
  --color-accent-soft: #dbeafe;
  --color-accent-contrast: #1d4ed8;

  --color-accent-2: #d97706;
  --color-accent-2-soft: #fef3c7;

  --color-danger: #dc2626;
  --color-danger-soft: #fee2e2;

  --radius: 16px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.03);
}

html,
body,
#app {
  height: 100%;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-tap-highlight-color: transparent;
}

* {
  box-sizing: border-box;
}
</style>
