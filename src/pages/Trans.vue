<template>
  <q-page padding :style-fn="(offset: number) => { return { height: `calc(100vh - ${offset}px)` } }">
    <div class="fit">

      <q-input v-model="searchQuery" :placeholder="$t('trans.search')" @update:model-value="fuzzySearch" debounce="300"
        class="bg-primary-85 border-m3 q-px-lg full-width" borderless clearable clear-icon="mdi-close"
        @clear="clearSearch">
        <template #prepend>
          <q-icon name="mdi-text-search-variant" />
        </template>
      </q-input>

      <m3Btn v-if="pbStore.isLoggedIn" type="4" icon="mdi-plus" :labelKey="$t('trans.add_translation')"
        @click="addTranslation" class="full-width q-my-md" />


      <q-virtual-scroll :items="groupedTranslationsArray" :item-size="53" :key-field="'id'"
        class="full-width q-pb-md border-m3"
        :style="pbStore.isLoggedIn ? 'height: calc(100% - 120px);' : 'height: calc(100% - 50px);'">
        <template #default="{ item, index }">
          <div class="group-container bg-primary-98 border-m3 q-pa-sm q-mb-md">
            <span class="group-title text-subtitle1 q-mb-xs border-m3 bg-primary-95 q-pa-xs row justify-center"
              style="padding-top: 3px !important; padding-bottom: 3px !important">
              {{ $t(`trans.${item.group}`) != `trans.${item.group}` ? $t(`trans.${item.group}`) : item.group }}
            </span>
            <q-separator v-if="item.translations.length" />
            <q-list v-if="item.translations.length" separator>
              <q-item v-for="translation in item.translations" :key="translation.id">
                <q-item-section>
                  <q-item-label>
                    <div class="row">
                      <div class="col">{{ translation.word }}</div>
                      <div class="col">{{ translation.translation }}</div>
                    </div>
                  </q-item-label>
                  <q-item-label caption v-if="translation.description">{{ translation.description }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <m3Btn v-if="pbStore.isLoggedIn" type="5" icon="mdi-pencil" :tooltipKey="$t('trans.edit')" flat
                    no-caps @click="editTranslation(translation.id)" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </template>
      </q-virtual-scroll>

    </div>



    <q-dialog v-model="dialog_bool" persistent>
      <q-card style="max-width: 500px; width: 100%;">
        <q-card-section class="row items-center q-pb-none">
          <div class="full-width row">
            <q-input v-model="currentTranslation.word" :label="$t('trans.Word')" class="col-sm full-width">
              <template v-slot:prepend>
                <q-icon name="mdi-file-word-box-outline" />
              </template>
            </q-input>
            <q-input v-model="currentTranslation.translation" :label="$t('trans.Translation')"
              class="col-sm full-width">
              <template v-slot:prepend>
                <q-icon name="mdi-translate-variant" />
              </template>
            </q-input>
          </div>
          <q-input v-model="currentTranslation.description" :label="$t('trans.Description')" type="textarea" autogrow
            class="full-width">
            <template v-slot:prepend>
              <q-icon name="mdi-text" />
            </template>
          </q-input>

          <q-select :model-value="currentTranslation.collection" @update:model-value="(val) => chooseSelect(val.value)"
            :label="$t('trans.select_collection')" :behavior="$q.screen.xs ? 'dialog' : 'menu'" borderless
            color=" primary-35" class="bg-primary-85 border-m3 q-px-lg q-mt-md full-width"
            :options="[...getGroupNames().map((folder: string | any) => { return { label: folder, value: folder } }), { icon: 'mdi-folder-off-outline', label: $t('trans.remove_from_collection'), value: 'remove_from_collection' }, { icon: 'mdi-folder-multiple-plus', label: $t('trans.add_to_new_collection'), value: 'add_to_new_collection' }]">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon v-if="currentTranslation.collection == scope.opt.label" name="mdi-check" />
                  <q-icon v-else :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

        </q-card-section>
        <q-card-actions class="q-pa-md">
          <m3Btn type="5" color="gray" :label="$t('trans.Cancel')" flat no-caps @click="dialog_bool = false" />
          <m3Btn v-if="pbStore.isLoggedIn" type="5" color="error" :label="$t('trans.Delete')" flat no-caps
            @click="deleteTranslation()" />
          <q-space />
          <m3Btn type="5" color="white" :label="$t('trans.Save')" flat no-caps @click="saveTranslation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import Fuse from 'fuse.js';
import m3Btn from 'components/m3Btn.vue';
import { Dialog } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePocketBaseStore } from 'src/stores/pocketbase';

const { t } = useI18n();
const pbStore = usePocketBaseStore();

// Reactive state variables
const searchQuery = ref('');
const translations = ref([]);
const filteredTranslations = ref([]);
const groupedTranslations = ref({});
const dialog_bool = ref(false);
const currentIndex = ref(-1);
const currentTranslation = ref({
  word: '',
  translation: '',
  description: '',
  collection: ''
});

const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

const groupedTranslationsArray = computed(() => {
  return Object.keys(groupedTranslations.value).map(group => ({
    group,
    translations: groupedTranslations.value[group]
  }));
})

// Fetch translations from PocketBase
const fetchTranslations = async () => {
  try {
    const records = await pbStore.pb.collection('translations').getFullList();
    translations.value = records.map(record => ({
      id: record.id,
      word: record.word,
      translation: record.translation,
      description: record.description || '',
      collection: record.collection || ''
    }));
    fuzzySearch();
  } catch (error) {
    console.error('Error fetching translations:', error);
  }
};

// Function to group translations by collection
const groupTranslations = () => {
  groupedTranslations.value = filteredTranslations.value.reduce((grouped, translation) => {
    const collection = translation.collection || 'Uncategorized';
    if (!grouped[collection]) {
      grouped[collection] = [];
    }
    grouped[collection].push(translation);
    return grouped;
  }, {});
};

const getGroupNames = () => {
  return Object.keys(groupedTranslations.value).filter((name) => name != 'Uncategorized');
};

let fuse = null;

const clearSearch = () => {
  searchQuery.value = ''
  filteredTranslations.value = translations.value;
  groupTranslations();
}

const createFuse = () => {
  if (!fuse) {
    const options = {
      keys: ['word', 'translation', 'description', 'collection'],
      threshold: 0.3,
    };
    fuse = new Fuse(translations.value, options);
  }
};

const fuzzySearch = async () => {
  createFuse(); // Create or reuse the Fuse instance

  if (searchQuery.value) {
    const searchResults = fuse.search(searchQuery.value, { limit: 500 });
    filteredTranslations.value = searchResults.map(result => result.item);
  } else {
    filteredTranslations.value = translations.value;
  }

  groupTranslations();
};

function chooseSelect(folderName: string) {
  if (folderName == 'remove_from_collection') {
    currentTranslation.value.collection = undefined;
  } else if (folderName == 'add_to_new_collection') {
    Dialog.create({
      title: t('trans.new_collection_name'),
      prompt: {
        model: '',
        placeholder: t('trans.enter_name'),
        isValid: ((val) => !getGroupNames().includes(val) && !['remove_from_collection', 'add_to_new_collection'].includes(val) && /^[a-zA-Z0-9\s_-]{2,35}$/.test(val)),
        type: 'text',
      },
      color: 'primary',
      class: 'bg-primary-93',
      style: 'border-radius: 25px;',
      ok: {
        'no-caps': true,
        flat: true,
      },
      cancel: {
        'no-caps': true,
        flat: true,
      },
    }).onOk(async (data) => {
      currentTranslation.value.collection = data;
    })
  } else if (getGroupNames().includes(folderName)) {
    currentTranslation.value.collection = folderName;
  }
}

// Function to add a new translation
const addTranslation = () => {
  if (!pbStore.isLoggedIn) {
    alert("You must be logged in to add translations.");
    return;
  }
  currentTranslation.value = { word: '', translation: '', description: '', collection: '' };
  currentIndex.value = -1;
  dialog_bool.value = true;
};

// Function to edit an existing translation
const editTranslation = (id) => {
  if (!pbStore.isLoggedIn) {
    alert("You must be logged in to edit translations.");
    return;
  }
  currentTranslation.value = { ...translations.value.find((el) => el.id = id) };
  currentIndex.value = translations.value.findIndex((el) => el.id = id);
  dialog_bool.value = true;
};

// Function to delete a translation
function deleteTranslation() {
  Dialog.create({
    title: t('trans.delete_question'),
    color: 'primary',
    style: 'border-radius: 25px;',
    class: 'bg-primary-93',
    ok: {
      'no-caps': true,
      flat: true,
    },
    cancel: {
      'no-caps': true,
      flat: true,
    },
  }).onOk(async () => {
    if (currentIndex.value >= 0) {
      const originalId = translations.value[currentIndex.value].id;
      try {
        await pbStore.pb.collection('translations').delete(originalId);
        translations.value.splice(currentIndex.value, 1);
        fuzzySearch();
      } catch (error) {
        console.error('Error deleting translation:', error);
      }
    }
  });
}

// Function to save a translation
const saveTranslation = async () => {
  if (currentIndex.value >= 0) {
    const originalId = translations.value[currentIndex.value].id;
    try {
      await pbStore.pb.collection('translations').update(originalId, currentTranslation.value);
    } catch (error) {
      console.error('Error updating translation:', error);
    }
  } else {
    try {
      const record = await pbStore.pb.collection('translations').create(currentTranslation.value);
      translations.value.push({
        id: record.id,
        ...currentTranslation.value,
      });
    } catch (error) {
      console.error('Error creating translation:', error);
    }
  }
  dialog_bool.value = false;
  fetchTranslations();
};

// Subscribe to real-time changes
let subscription: any = null;
const subscribeToTranslations = () => {
  subscription = pbStore.pb.collection('translations').subscribe('*', (e) => {
    switch (e.action) {
      case 'create':
        translations.value.push({
          id: e.record.id,
          ...e.record,
        });
        break;
      case 'update':
        const index = translations.value.findIndex(t => t.id === e.record.id);
        if (index > -1) {
          translations.value[index] = {
            id: e.record.id,
            ...e.record,
          };
        }
        break;
      case 'delete':
        translations.value = translations.value.filter(t => t.id !== e.record.id);
        break;
    }
    fuzzySearch(); // Re-run fuzzy search after updates
  });
};

// Clean up the subscription
onBeforeUnmount(() => {
  if (subscription) {
    pbStore.pb.collection('translations').unsubscribe(subscription);
  }
});

// Initialize the component
onMounted(() => {
  fetchTranslations();
  subscribeToTranslations();
});
</script>

<style scoped>
.sticky-input {
  position: sticky;
  top: 65px;
  z-index: 100;
}

.group-container {
  position: relative;
}

.group-title {
  position: sticky;
  top: 0;
  background-color: inherit;
  z-index: 1;
  padding: 10px 0;
}
</style>
