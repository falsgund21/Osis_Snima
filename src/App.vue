<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEosis } from './composables/useEosis';

const { settings, fetchSettings } = useEosis();

onMounted(async () => {
  // Muat preferensi awal
  try {
    const data = await fetchSettings();
    if (data.school_name) {
      document.title = `${data.school_name} - eOSIS`;
    }
  } catch (err) {
    console.warn('Initial settings load notice:', err);
  }
});
</script>
