<template>
  <v-dialog
    :model-value="dialog"
    @update:model-value="(val) => emitUpdate(val)"
    max-width="500"
  >
    <v-card>
      <v-card-title class="px-5 pt-5">Add Claimer Details</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="isValid" class="pt-5 overflow-y-hidden">
          <v-row>
            <!-- Claimer Name -->
            <v-col cols="12">
              <v-text-field
                v-model="claimer.name"
                placeholder="Claimer's Full Name"
                variant="outlined"
                density="compact"
                :rules="nameRules"
                required
              />
            </v-col>

            <!-- Claimed Date -->
            <v-col cols="12">
              <v-text-field
                v-model="claimer.date"
                placeholder="Select Date"
                type="date"
                variant="outlined"
                density="compact"
                :rules="dateRules"
                required
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12">
              <v-text-field
                v-model="claimer.email"
                placeholder="Claimer's Email"
                type="email"
                variant="outlined"
                density="compact"
                :rules="emailRules"
                required
              />
            </v-col>

            <!-- Phone -->
            <v-col cols="12">
              <v-text-field
                v-model="claimer.phone"
                placeholder="Claimer's Phone Number"
                prefix="+91"
                type="tel"
                variant="outlined"
                density="compact"
                :rules="phoneRules"
                required
                maxlength="10"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pb-5 px-5">
        <v-spacer />
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveClaimer" :disabled="!isValid"
          >ADD</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from "vue";
import { useLostItems } from "~/composables/items/claims/addClaimer";
import { useCookie } from "#app";

// Props from parent
const props = defineProps({
  dialog: Boolean,
  itemId: [String, Number],
});

// Emit events to parent
const emits = defineEmits(["update:dialog", "saved"]);

// Form validity
const isValid = ref(false);

// Reactive claimer object
const claimer = reactive({
  name: "",
  date: "",
  email: "",
  phone: "",
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const showSnackbar = (message: string, color: string = "success") => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

// Validation rules
const nameRules = [
  (v: string) => !!v || "Name is required",
  (v: string) => (v && v.length >= 2) || "Name must be at least 2 characters",
];

const dateRules = [
  (v: string) => !!v || "Date is required",
  (v: string) => {
    if (!v) return true;
    const selected = new Date(v);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selected <= today || "Date cannot be in the future";
  },
];

const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Email must be valid",
];

const phoneRules = [
  (v: string) => !!v || "Phone is required",
  (v: string) => /^\d{10}$/.test(v) || "Phone must be exactly 10 digits",
];

// Reset form whenever dialog opens
watch(
  () => props.dialog,
  (val) => {
    if (val) {
      claimer.name = "";
      claimer.date = "";
      claimer.email = "";
      claimer.phone = "";
    }
  }
);

// Emit dialog state update
const emitUpdate = (val: boolean) => {
  emits("update:dialog", val);
};

// Close dialog
const closeDialog = () => {
  emits("update:dialog", false);
};

// API composable
const { addClaimer: addClaimerApi } = useLostItems();

// Save claimer
const saveClaimer = async () => {
  if (!isValid.value) {
    showSnackbar("Please fill all fields correctly.", "error");
    return;
  }

  if (!props.itemId) {
    showSnackbar("Item ID is missing.", "error");
    return;
  }

  const fullClaimer = {
    name: claimer.name,
    date: claimer.date,
    email: claimer.email,
    phone: "+91" + claimer.phone,
    addedBy: useCookie("user").value.uid,
  };

  try {
    await addClaimerApi(props.itemId, fullClaimer);

    emits("saved", fullClaimer);

    closeDialog();
    showSnackbar("Claimer added successfully!", "success");
  } catch (err: any) {
    console.error("Error adding claimer:", err);
    showSnackbar(err.message || "Failed to add claimer.", "error");
  }
};
</script>
