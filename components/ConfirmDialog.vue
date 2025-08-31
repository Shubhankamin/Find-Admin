<template>
  <v-dialog v-model="model" max-width="400">
    <v-card>
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="cancel">{{ cancelText }}</v-btn>
        <v-btn color="red" variant="tonal" @click="confirm">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: 'Do you want to proceed with this action?' },
  confirmText: { type: String, default: 'Yes' },
  cancelText: { type: String, default: 'Cancel' }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function confirm() {
  emit('confirm')
  model.value = false
}

function cancel() {
  emit('cancel')
  model.value = false
}
</script>
