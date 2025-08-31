<template>
  <div>
    <div class="d-flex text-left justify-start pt-5">
      <v-icon start color="black" variant="text" @click="goBack" class="mb-10"
        >mdi-arrow-left</v-icon
      >
      <div v-if="mode == 'edit'">
        <h2 class="mb-4">Edit {{ itemId }}</h2>
      </div>
      <div v-else>
        <h2 class="mb-4">Add New Lost Item</h2>
      </div>
    </div>
    <v-container fluid class="px-5">
      <v-form
        ref="formRef"
        v-model="isValid"
        lazy-validation
        class="overflow-y-hidden"
      >
        <v-row class="overflow-y-hidden">
          <v-col cols="12" md="6" class="overflow-y-hidden">
            <p class="py-2">Item Name:</p>
            <v-text-field
              v-model="form.name"
              placeholder="Item Name"
              variant="outlined"
              required
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="py-2">Description:</p>
            <v-textarea
              v-model="form.description"
              placeholder="Describe the item"
              variant="outlined"
              required
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="py-2">Where was it lost?:</p>
            <v-text-field
              v-model="form.location"
              placeholder="Where was it lost?"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="py-2">Email:</p>
            <v-text-field
              v-model="form.email"
              placeholder="Email"
              type="email"
              variant="outlined"
              density="compact"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="py-2">Status:</p>
            <v-select
              v-model="form.status"
              :items="statusOptions"
              placeholder="Select Status"
              variant="outlined"
              density="compact"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="py-2">Posted At:</p>
            <v-text-field
              v-model="form.postedAt"
              placeholder="Posted At"
              type="date"
              variant="outlined"
              density="compact"
              required
              :readonly="mode === 'edit'"
            />
            <!-- <VueDatePicker v-model="date" /> -->
          </v-col>
          <v-col cols="12" md="6">
            <p class="py-2">Threshold:</p>
             <v-select
              v-model="form.threshold"
              :items="thresholdOptions"
              item-title="label"
              item-value="value"
              placeholder="Select Threshold"
              variant="outlined"
              required
              density="compact"
            />
          </v-col>

          <v-col cols="12">
            <p class="mb-2">Upload up to 4 images (Min 1 required):</p>
            <v-row>
              <v-col
                v-for="(img, index) in imagePreviews"
                :key="index"
                cols="3"
                class="d-flex flex-column align-center pt-10"
              >
                <div class="box">
                  <v-img
                    v-if="img"
                    :src="img"
                    class="mb-2"
                    height="100"
                    width="100"
                    cover
                  />
                  <v-btn
                    v-else
                    icon="mdi-plus"
                    variant="outlined"
                    color="grey"
                    @click="triggerFileInput(index)"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    class="d-none"
                    ref="fileInputs"
                    @change="handleImageUpload($event, index)"
                  />
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>

      <div class="d-flex justify-end pt-16">
        <v-btn variant="text" color="grey" class="mr-3" @click="cancel">
          Cancel
        </v-btn>
        <v-btn color="primary" @click="save"> Save </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
const date = ref();

const router = useRouter();
const isValid = ref(false);
const route = useRoute();

// const mode = ref("add");

const mode = route.query.mode;
const itemId = route.params.id;

console.log("Mode:", mode, "Item ID:", itemId);

const form = reactive({
  name: "",
  description: "",
  location: "",
  email: "",
  status: "",
  postedAt: "",
  images: [],
  threshold: null, // NEW FIELD
});

const thresholdOptions = [
  { label: "1 Week", value: 7 },
  { label: "2 Weeks", value: 14 },
  { label: "3 Weeks", value: 21 },
  { label: "1 Month", value: 30 },
  { label: "3 Months", value: 90 },
];

const statusOptions = ["pending", "claimed"];

const imagePreviews = ref([null, null, null, null]);
const fileInputs = ref([]);

const goBack = () => router.back();
const cancel = () => router.push("/items");

const triggerFileInput = (index: number) => {
  fileInputs.value[index]?.click();
};

const handleImageUpload = (event: Event, index: number) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    form.images[index] = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviews.value[index] = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const save = () => {
  if (!isValid.value) return;

  if (!form.postedAt || !form.threshold) {
    alert("Please select both Posted At date and Threshold.");
    return;
  }

  const postedAtDate = new Date(form.postedAt);
  if (isNaN(postedAtDate.getTime())) {
    alert("Invalid Posted At date.");
    return;
  }

  const thresholdDays = parseInt(form.threshold);
  const expiryDate = new Date(postedAtDate);
  expiryDate.setDate(expiryDate.getDate() + thresholdDays);

  // Format for readable output
  const formattedExpiryDate = expiryDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const data = {
    ...form,
    postedAt: postedAtDate.toISOString(),
    thresholdDays: thresholdDays,
    expiryDate: expiryDate.toISOString(),
  };

  console.log("Final Data (Ready to Save):", data);
  console.log(`✅ Expiry Date (Readable): ${formattedExpiryDate}`);
  alert(
    `Data saved!\n\nExpiry Date: ${formattedExpiryDate}\n\n${JSON.stringify(
      data,
      null,
      2
    )}`
  );
};
</script>
<style scoped>
.box {
  border: 2px dashed #ccc;
  border-radius: 8px;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
::v-deep(.dp__menu) {
  z-index: 9999 !important;
}
</style>
