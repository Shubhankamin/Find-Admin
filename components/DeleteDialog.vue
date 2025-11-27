<template>
  <v-dialog v-model="internalDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <p>{{ message }}</p>
        <!-- <p v-if="itemName" class="font-weight-bold text-red">
          {{ itemName }}
        </p> -->
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click="closeDialog">
          {{ cancelText }}
        </v-btn>
        <v-btn color="error" :loading="loading" @click="confirmDelete">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  modelValue: boolean; // ✅ used for v-model
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue", "confirm"]);

const loading = ref(false);

// ✅ Create a computed wrapper for v-dialog
const internalDialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const closeDialog = () => {
  emit("update:modelValue", false);
};

const confirmDelete = async () => {
  loading.value = true;
  try {
    await emit("confirm"); // parent handles delete
  } finally {
    loading.value = false;
    emit("update:modelValue", false); // close after confirm
  }
};
</script>
