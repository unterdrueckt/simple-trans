<template>
  <q-btn :icon="$props.icon" :icon-right="$props.iconRight" :stretch="$props.stretch"
    :v-close-popup="$props.vClosePopup" :ripple="$props.ripple" :disable="$props.disable" :loading="$props.loading"
    :percentage="$props.percentage" :unelevated="$props.type != 1" :outline="$props.type == 4" no-caps
    class="border-m3 text-subtitle2" :class="[classes, { 'no-hover': !$props.hover }]" @click="handleClick">
    <div v-if="$props.iconTop || $props.labelKey || $props.label || $props.iconBottom" class="column q-px-xs">
      <div v-if="$props.iconTop" class="col">
        <q-icon :name="$props.iconTop" />
      </div>
      <div v-if="$props.labelKey" class="col">
        {{ $t($props.labelKey) }}
      </div>
      <div v-else-if="$props.label" class="col">
        {{ $props.label }}
      </div>
      <div v-if="$props.iconBottom" class="col">
        <q-icon :name="$props.iconBottom" />
      </div>
    </div>
    <q-tooltip v-if="$props.tooltip" :delay="500" transition-show="fade" transition-hide="fade"
      class="bg-secondary-84 secondary-1">
      {{ $props.tooltip }}
    </q-tooltip>
    <q-tooltip v-if="$props.tooltipKey" :delay="500" transition-show="fade" transition-hide="fade"
      class="bg-secondary-84 secondary-1">
      {{ $t($props.tooltipKey) }}
    </q-tooltip>
  </q-btn>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
// Emits
const emit = defineEmits([
  'click',
])

// Props
const props = defineProps({
  type: {
    type: [Number, String],
    required: true,
    validator: (value) => {
      // Mapping of string types to numbers
      const typeMapping = {
        'elevated': 1,
        'filled': 2,
        'filled-tonal': 3,
        'outlined': 4,
        'text': 5,
        'icon': 6,
        'segmented': 7,
        'fab': 8,
        'extended-fab': 8,
      };

      // Check if the value is a number between 1 and 8
      if (typeof value === 'number') {
        return value >= 1 && value <= 8;
      }

      // Check if the value is a number string
      if (typeof value === 'string' && !isNaN(parseInt(value))) {
        const parsedValue = parseInt(value);
        return parsedValue >= 1 && parsedValue <= 8;
      }

      // Check if the value is one of the allowed strings
      if (typeof value === 'string') {
        return typeMapping.hasOwnProperty(value.toLocaleLowerCase());
      }

      // If none of the above conditions are met, return false
      return false;
    },
  },
  color: {
    type: String,
    required: false
  },
  label: {
    type: String,
    required: false
  },
  labelKey: {
    type: String,
    required: false
  },
  tooltip: {
    type: String,
    required: false
  },
  tooltipKey: {
    type: String,
    required: false
  },
  icon: {
    type: String,
    required: false
  },
  iconRight: {
    type: String,
    required: false
  },
  iconTop: {
    type: String,
    required: false
  },
  iconBottom: {
    type: String,
    required: false
  },
  stretch: {
    type: Boolean,
    required: false,
    default: false
  },
  vClosePopup: {
    type: Boolean,
    required: false,
    default: false
  },
  ripple: {
    type: [Boolean, Object],
    required: false,
    default: true
  },
  disable: {
    type: Boolean,
    required: false,
    default: false
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  },
  hover: {
    type: Boolean,
    required: false,
    default: true
  },
  percentage: {
    type: Number,
    required: false,
    default: 0
  },
});

const classes = computed(() => {

  let color = props.color || 'primary'

  // Mapping of types to classes
  const classMapping: { [key: number]: string } = {
    1: `bg-${color}-100 ${color}-30-i`,
    2: `bg-${color}-30 ${color}-100-i`,
    3: `bg-${color}-90 ${props.color ? color : 'gray'}-10-i`,
    4: `bg-${color}-100 ${color}-30-i`,
    5: `${color}-30-i`,
  };

  // Return the classes for the type
  return classMapping[props.type as number] || '';
});

// Methods
const handleClick = () => {
  emit('click');
};
</script>
