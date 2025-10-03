<!-- Main Form Builder application component -->
<template>
  <div id="app" class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Form Builder
        </h1>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Editors -->
      <div
        data-testid="left-panel"
        class="w-1/2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-auto"
      >
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Editors
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Editor panel will appear here
          </p>
        </div>
      </div>

      <!-- Right Panel: Preview -->
      <div
        data-testid="right-panel"
        class="w-1/2 bg-gray-50 dark:bg-gray-900 overflow-auto"
      >
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Preview
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Form preview will appear here
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
