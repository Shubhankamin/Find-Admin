<template>
  <div>
    <div class="d-flex text-left justify-start pt-5">
      <v-icon start color="black" variant="text" @click="goBack" class="mb-10"
        >mdi-arrow-left</v-icon
      >
      <div v-if="mode == 'edit'">
        <!-- {{ form.threshold }} -->
        <h2 class="mb-4">Edit {{ form?.name }}</h2>
      </div>
      <div v-else>
        <h2 class="mb-4">Add New Lost Item</h2>
      </div>
    </div>
    <div class="d-flex text-left justify-end pb-5 px-5">
      <div v-if="form.status === 'pending' && mode === 'edit'">
        <!-- {{ form.threshold }} -->
        <v-btn color="green" @click="openClaimerDialog">Add Claimer</v-btn>
      </div>
      <!-- <div v-else>
        <h2 class="mb-4">Add New Lost Item</h2>
      </div> -->
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
            <p class="py-2">Where was it found?:</p>
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
          </v-col>
          <v-col cols="12" md="6" v-if="mode === 'edit'">
            <p class="py-2">Expiry Date:</p>
            <v-text-field
              v-model="form.expiryDate"
              placeholder="Expiry Date"
              type="date"
              variant="outlined"
              density="compact"
              required
              readonly
            />
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
                <div class="relative d-inline-block">
                  <!-- Image Preview -->
                  <v-img
                    v-if="img"
                    :src="img"
                    class="mb-2 rounded-lg"
                    height="100"
                    width="100"
                    cover
                  />

                  <!-- Delete Button (top-right) -->
                  <v-btn
                    v-if="img"
                    icon="mdi-close"
                    size="small"
                    variant="flat"
                    color="red"
                    class="absolute top-0 right-0"
                    @click="removeImage(index)"
                  />

                  <!-- Upload Button -->
                  <v-btn
                    v-else
                    icon="mdi-plus"
                    variant="outlined"
                    color="grey"
                    @click="triggerFileInput(index)"
                  />

                  <!-- Hidden File Input -->
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

      <add-claimer-dialog
        :dialog="showClaimerDialog"
        :item-id="itemId"
        @update:dialog="showClaimerDialog = $event"
        @saved="handleClaimerSaved"
      />

      <!-- Claimer Info Section -->
      <div v-if="form.claimer" class="mt-12 overflow-y-hidden px-5">
        <h3 class="mt-5 mb-8">Claimer Information</h3>
        <v-row>
          <v-col cols="12" md="6">
            <p class="mb-5">Claimer Name</p>

            <v-text-field
              v-model="form.claimer.name"
              placeholder="Claimer Name"
              readonly
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="mb-5">Claimed On</p>

            <v-text-field
              placeholder="Date Claimed"
              v-model="form.claimer.date"
              readonly
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="mb-5">Claimer Email</p>
            <v-text-field
              placeholder="Email"
              v-model="form.claimer.email"
              readonly
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <p class="mb-5">Claimer Phone</p>

            <v-text-field
              placeholder="Phone"
              v-model="form.claimer.phone"
              readonly
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>
      </div>

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
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGetOneLostItem } from "~/composables/items/getOneItem";
import { useAddLostItem } from "~/composables/items/addItems";
import { useUpdateLostItem } from "~/composables/items/updateItems";
import AddClaimerDialog from "~/components/AddClaimerDialog.vue";

const { updateLostItem } = useUpdateLostItem();

const router = useRouter();
const route = useRoute();
const { getOneLostItem } = useGetOneLostItem();
const { addLostItem } = useAddLostItem(); // ✅
const showClaimerDialog = ref(false);
const isValid = ref(false);
const mode = route.query.mode;
const itemId = route.params.id;

console.log("Mode:", mode, "Item ID:", itemId);

const form = reactive({
  name: "",
  description: "",
  location: "",
  email: "",
  status: "pending", // default
  postedAt: "",
  images: [],
  threshold: null,
  expiryDate: "",
  claimer: {
    name: "",
    date: "",
    email: "",
    phone: "",
  },
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

const openClaimerDialog = () => {
  showClaimerDialog.value = true;
};

const handleClaimerSaved = async (claimer: any) => {
  console.log("Claimer saved:", claimer);
  form.status = "claimed"; // Update status locally
  form.claimer = claimer; // Store latest claimer

  // Optional: immediately update Firestore with status + claimer
  try {
    await updateLostItem(itemId as string, {
      status: "claimed",
      claimer: claimer,
    });
    console.log("Item status updated to claimed!");
  } catch (err) {
    console.error("Failed to update item status:", err);
  }
};

// ✅ Fetch existing item if editing
onMounted(async () => {
  if (mode === "edit" && itemId) {
    try {
      const item = await getOneLostItem(itemId);
      console.log("Fetched item for editing:", item);

      form.name = item?.itemName ?? (item?.name || "");
      form.description = item?.description || "";
      form.location = item?.location || "";
      form.email = item?.contactEmail || "";
      form.status = item?.status || "pending";
      form.postedAt =
        item?.createdAt?.toDate?.().toISOString().substring(0, 10) || "";
      form.threshold = item?.threshold || null;
      form.expiryDate =
        item?.expiryDate?.toDate?.().toISOString().substring(0, 10) || "";
      form.claimer = item?.claimer || null;
      form.claimerName = item?.claimer?.name || "";
      form.claimerDate = item?.claimer?.date || "";
      form.claimerEmail = item?.claimer?.email || "";
      form.claimerPhone = item?.claimer?.phone || "";

      if (Array.isArray(item?.images)) {
        form.images = item.images;
        imagePreviews.value = item.images.map((img: string) => img || null);
        while (imagePreviews.value.length < 4) imagePreviews.value.push(null);
      }
    } catch (err) {
      console.error("Error fetching item:", err);
    }
  }
});

const handleImageUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];

  try {
    // Convert file → base64
    const base64String = await convertToBase64(file);

    // Save into form + preview arrays
    form.images[index] = file; // keep original file for saving later
    imagePreviews.value[index] = base64String; // base64 for immediate preview

    console.log(`Image ${index} uploaded successfully`);
  } catch (error) {
    console.error("Error converting image:", error);
  } finally {
    // Reset input value so user can re-upload same file if needed
    target.value = "";
  }
};

const removeImage = (index: number) => {
  form.images[index] = null;
  imagePreviews.value[index] = null;
};

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const onClaimerSaved = async (claimer: any) => {
  console.log("Claimer saved:", claimer);
  form.status = "claimed"; // Update status locally
  form.claimer = claimer; // Store latest claimer

  // Optional: immediately update Firestore with status + claimer
  try {
    await updateLostItem(itemId as string, {
      status: "claimed",
      claimer: claimer,
    });
    console.log("Item status updated to claimed!");
  } catch (err) {
    console.error("Failed to update item status:", err);
  }
};

const save = async () => {
  if (!isValid.value) return;

  try {
    const selectedImages = form.images.filter((img) => img);

    // Convert only File objects → Base64
    const processedImages = await Promise.all(
      selectedImages.map(async (img: any) => {
        if (img instanceof File) {
          return await convertToBase64(img);
        }
        return img; // keep existing base64 strings
      })
    );

    // Calculate expiry date from postedAt + threshold
    let createdAtDate = form.postedAt ? new Date(form.postedAt) : new Date();
    let expiryDate = null;

    if (createdAtDate && form.threshold) {
      expiryDate = new Date(createdAtDate);
      expiryDate.setDate(expiryDate.getDate() + form.threshold);
    }

    const payload = {
      itemName: form.name,
      description: form.description,
      location: form.location,
      contactEmail: form.email,
      category: "default",
      status: form.status || "pending",
      images: processedImages,
      threshold: form.threshold,
      expiryDate, // <-- ADD THIS
      createdAt: createdAtDate, // only in edit mode (keep existing)
    };

    if (mode === "add") {
      const id = await addLostItem(payload);
      console.log("✅ Item added with ID:", id);
      router.push("/items");
    }

    if (mode === "edit" && itemId) {
      await updateLostItem(itemId as string, payload);
      console.log("✅ Item updated successfully!");
      router.push("/items");
    }
  } catch (err) {
    console.error("❌ Error saving item:", err);
  }
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
