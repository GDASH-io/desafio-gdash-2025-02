<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const message = ref("Carregando...");

onMounted(async () => {
  const res = await fetch("http://localhost:8080/api/hello");
  const data = await res.json();
  message.value = data.text;
});
</script>
