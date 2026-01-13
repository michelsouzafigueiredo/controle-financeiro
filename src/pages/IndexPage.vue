<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Dashboard</div>
    <div class="text-subtitle1">Bem-vindo ao Controle Financeiro</div>

    <q-separator class="q-my-md" />

    <!-- Test Data Table Placeholder -->
    <div class="q-mt-md">
      <div class="text-h6">Teste de Conexão com Banco de Dados</div>
      <div v-if="testData.length">
        <q-list bordered separator>
          <q-item v-for="item in testData" :key="item.id">
            <q-item-section>{{ item.id }} - {{ item.name }}</q-item-section>
            <q-item-section side>{{ item.created_at }}</q-item-section>
          </q-item>
        </q-list>
      </div>
      <div v-else>
        <p>Carregando ou sem dados...</p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface TestData {
  id: number;
  name: string;
  created_at: number;
}

const testData = ref<TestData[]>([]);

onMounted(async () => {
  try {
    // @ts-expect-error - myAPI is injected via preload
    testData.value = await window.myAPI.getTestData();
    console.log('Dados recebidos:', testData.value);
  } catch (e) {
    console.error('Erro ao buscar dados:', e);
  }
});
</script>
