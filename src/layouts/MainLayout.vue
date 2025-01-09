<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-primary-90-d bg-primary-10-l">
      <q-toolbar>

        <q-toolbar-title>
          simple-trans
        </q-toolbar-title>

        <q-select v-model="locale" :options="localeOptions" icon="mdi-translation" dense borderless emit-value
          map-options options-dense dark />

        <m3Btn v-if="!pocketBaseStore.isLoggedIn" type="5" icon="mdi-login" color="black"
          :tooltipKey="$t('login.login')" flat no-caps to="/login" />
        <m3Btn v-else type="5" icon="mdi-logout" color="black" :tooltipKey="$t('login.logout')" flat no-caps
          @click="pocketBaseStore.logout" />
        <m3Btn type="5" icon="mdi-theme-light-dark" color="black" flat no-caps @click="Dark.toggle()" />

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import m3Btn from 'components/m3Btn.vue';
import { usePocketBaseStore } from 'src/stores/pocketbase';
import { Dark } from 'quasar';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n({ useScope: 'global' })
const pocketBaseStore = usePocketBaseStore();
defineOptions({
  name: 'MainLayout'
});

const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'de', label: 'German' }
]

const isLoggedIn = ref(!!localStorage.getItem('authToken'));

</script>

<style scoped></style>
