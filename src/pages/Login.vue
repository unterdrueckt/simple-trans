<template>
  <q-card class="cards fixed-center" style="min-width: 320px;">
    <div class="q-pa-md q-ml-md q-mt-sm text-h6">
      <span v-if="pocketBaseStore.isLoggedIn">
        <m3Btn type="2" icon="mdi-alert" label="Already logged in! Click to go home." color="black" flat no-caps
          to="/" />
      </span>
      <span v-else>
        {{ $t('login.login') }}
      </span>
    </div>
    <q-separator />
    <q-card-section class="q-pa-none">
      <q-form class="q-gutter-md" @submit.prevent="login">
        <div class="q-pa-lg">

          <!-- Display error message if login fails -->
          <q-badge v-if="pocketBaseStore.error" multi-line class="bg-error-50 q-pa-xs q-mb-sm">
            {{ pocketBaseStore.error }}
          </q-badge>

          <q-input v-model="email" borderless :label="$t('login.email')" class="login-form">
            <template #prepend>
              <q-icon name="mdi-email-outline" />
            </template>
          </q-input>
          <q-input v-model="password" borderless type="password" :label="$t('login.password')" class="login-form">
            <template #prepend>
              <q-icon name="mdi-lock-outline" />
            </template>
          </q-input>
        </div>
        <q-separator class="q-mt-none" />
        <q-card-actions class="q-pa-md q-mt-none">
          <q-btn flat rounded no-caps :label="$t('login.go_back')" to="/" class="login-btn q-px-lg" />
          <q-space />
          <q-btn flat rounded no-caps :label="$t('login.sign_in')" type="submit" class="login-btn q-px-lg" />
        </q-card-actions>
      </q-form>
    </q-card-section>

  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePocketBaseStore } from 'src/stores/pocketbase';
import m3Btn from 'components/m3Btn.vue';

const pocketBaseStore = usePocketBaseStore();
const router = useRouter();

const email = ref('');
const password = ref('');

const login = async () => {
  try {
    await pocketBaseStore.login(email.value, password.value);
    router.push({ path: '/', force: true });
  } catch (error) {
    console.error('Login failed:', error);
  }
};
</script>

<style scoped>
.cards {
  width: 400px;
  transition: all 0.15s;
}
</style>
