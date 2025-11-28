<template>
  <v-container fluid>
    <!-- Page Title -->
    <h1 class="text-h4 font-weight-bold mb-6">Dashboard</h1>
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" @click="showDialog = true">Add Announcement</v-btn>
    </div>

    <v-row>
      <v-col>
        <v-dialog v-model="showDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h6">Add Announcement</v-card-title>

            <v-card-text>
              <v-text-field
                v-model="announcementMessage"
                placeholder="Message"
                variant="outlined"
                hide-details="auto"
              />
              <v-text-field
                v-model="announcementEndDate"
                type="date"
                variant="outlined"
                placeholder="End Date (optional)"
                class="mt-4"
                hide-details="auto"
              />
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn variant="text" @click="showDialog = false">Cancel</v-btn>
              <v-btn
                color="primary"
                :loading="addingAnnouncement"
                @click="submitAnnouncement"
              >
                Submit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>

    <!-- Top Stats Section -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="3">
          <template v-if="loading">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </template>
          <template v-else>
            <v-icon size="32" color="primary" class="mb-2"
              >mdi-package-variant</v-icon
            >
            <h3 class="text-h5 font-weight-bold">Total Lost Items</h3>
            <p class="text-h6 mt-2">{{ totalLost }}</p>
          </template>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="3">
          <template v-if="loading">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </template>
          <template v-else>
            <v-icon size="32" color="success" class="mb-2"
              >mdi-check-circle</v-icon
            >
            <h3 class="text-h5 font-weight-bold">Claimed Items</h3>
            <p class="text-h6 mt-2">{{ claimedCount }}</p>
          </template>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="3">
          <template v-if="loading">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </template>
          <template v-else>
            <v-icon size="32" color="error" class="mb-2">mdi-alert</v-icon>
            <h3 class="text-h5 font-weight-bold">Pending Items</h3>
            <p class="text-h6 mt-2">{{ pendingCount }}</p>
          </template>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="3">
          <template v-if="loading">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </template>
          <template v-else>
            <v-icon size="32" color="purple" class="mb-2"
              >mdi-timer-alert</v-icon
            >
            <h3 class="text-h5 font-weight-bold">Expired Items</h3>
            <p class="text-h6 mt-2">{{ expiredCount }}</p>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recently Lost Items -->
    <h2 class="text-h5 font-weight-bold my-6">Recently Lost Items</h2>
    <v-card elevation="3">
      <template v-if="loading">
        <v-skeleton-loader type="table"></v-skeleton-loader>
      </template>
      <template v-else>
        <v-table>
          <thead>
            <tr class="bg-grey">
              <th class="text-left heading font-bold">Item Name</th>
              <th class="text-left heading font-bold">Location</th>
              <th class="text-left heading font-bold">Status</th>
              <th class="text-left heading font-bold">Posted On</th>
              <th class="text-left heading font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in recentLostItems" :key="i">
              <td @click="goToId(item?.id)" class="link">
                {{ item.itemName }}
              </td>
              <td>{{ item.location }}</td>
              <td>
                <v-chip
                  :color="item.status === 'claimed' ? 'green' : 'orange'"
                  size="small"
                  text-color="white"
                >
                  {{ item.status }}
                </v-chip>
              </td>
              <td>{{ formatTimestamp(item.createdAt) }}</td>
              <td>
                <v-btn
                  size="small"
                  color="primary"
                  variant="tonal"
                  @click="goToId(item?.id)"
                  >View</v-btn
                >
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>

    <!-- Expired Items -->
    <h2 class="text-h5 font-weight-bold my-6">Expired Items</h2>
    <v-card elevation="3">
      <template v-if="loading">
        <v-skeleton-loader type="table"></v-skeleton-loader>
      </template>
      <template v-else>
        <v-table>
          <thead>
            <tr class="bg-grey">
              <th class="text-left font-bold">Item Name</th>
              <th class="text-left font-bold">Location</th>
              <th class="text-left font-bold">Expired On</th>
              <th class="text-left font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in expiredItems" :key="i">
              <td @click="goToId(item?.id)" class="link">
                {{ item.itemName }}
              </td>
              <td>{{ item.location }}</td>
              <td>{{ formatTimestamp(item.expiryDate) }}</td>
              <td>
                <v-btn
                  size="small"
                  color="primary"
                  variant="tonal"
                  @click="goToId(item?.id)"
                  >View</v-btn
                >
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>

    <!-- Announcements -->
    <h2 class="text-h5 font-weight-bold my-6">Announcements</h2>
    <v-card elevation="3">
      <template v-if="loadingAnnouncements">
        <v-skeleton-loader type="table"></v-skeleton-loader>
      </template>
      <template v-else>
        <v-table>
          <thead>
            <tr class="bg-grey">
              <th class="text-left font-bold">Message</th>
              <th class="text-left font-bold">End Date</th>
              <th class="text-left font-bold">Status</th>
              <th class="text-left font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in announcements" :key="a.id">
              <td>{{ a.message }}</td>
              <td>{{ formatTimestamp(a.endDate) || "—" }}</td>
              <td>
                <v-chip
                  :color="a.isActive ? 'green' : 'red'"
                  size="small"
                  text-color="white"
                >
                  {{ a.isActive ? "Active" : "Disabled" }}
                </v-chip>
              </td>
              <td>
                <v-switch
                  v-model="a.isActive"
                  hide-details
                  inset
                  color="green"
                  :loading="togglingId === a.id"
                  @change="toggleStatus(a)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>
  </v-container>

  <v-snackbar v-model="showSnackbar" color="green" timeout="2500">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { updateDoc, doc } from "firebase/firestore";
import { useNuxtApp } from "#app";
import { useGetLostItems } from "~/composables/items/getLostItems";
import { useAddAnnouncement } from "~/composables/announcements/useAnnouncements";
import { useGetAnnouncements } from "~/composables/announcements/useGetAnnouncements";

const { announcements, getAnnouncements } = useGetAnnouncements();
const { addAnnouncement, loading: addingAnnouncement } = useAddAnnouncement();
const { getLostItems } = useGetLostItems();
const { $db } = useNuxtApp();
const router = useRouter();

const showDialog = ref(false);
const announcementMessage = ref("");
const announcementEndDate = ref("");
const loadingAnnouncements = ref(true);
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const togglingId = ref(null); // <-- Added for button loader

const loading = ref(true);

// Arrays
const recentLostItems = ref([]);
const expiredItems = ref([]);

// Fetch + categorize
const fetchItems = async () => {
  try {
    loading.value = true;
    const data = await getLostItems();
    const now = new Date();

    recentLostItems.value = data.filter((item) => {
      const expiry = item.expiryDate?.toDate?.();
      return item.status !== "expired" && expiry && expiry > now;
    });

    expiredItems.value = data.filter((item) => {
      const expiry = item.expiryDate?.toDate?.();
      return item.status !== "claimed" && expiry && expiry <= now;
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchItems();
  fetchAnnouncements();
});

const goToId = (id) => {
  router.push({ path: `/items/${id}`, query: { mode: "edit" } });
};

const totalLost = computed(
  () => recentLostItems.value.length + expiredItems.value.length
);
const claimedCount = computed(
  () =>
    [...recentLostItems.value, ...expiredItems.value].filter(
      (item) => item.status === "claimed"
    ).length
);
const pendingCount = computed(
  () => recentLostItems.value.filter((item) => item.status === "pending").length
);
const expiredCount = computed(() => expiredItems.value.length);

const formatTimestamp = (timestamp) => {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const fetchAnnouncements = async () => {
  loadingAnnouncements.value = true;
  await getAnnouncements();
  loadingAnnouncements.value = false;
};

const submitAnnouncement = async () => {
  if (!announcementMessage.value.trim()) return;

  await addAnnouncement({
    message: announcementMessage.value,
    endDate: announcementEndDate.value || undefined,
  });

  announcementMessage.value = "";
  announcementEndDate.value = "";
  showDialog.value = false;

  snackbarMessage.value = "Announcement added successfully";
  showSnackbar.value = true;

  fetchAnnouncements();
};
const toggleStatus = async (announcement) => {
  try {
    togglingId.value = announcement.id;
    const docRef = doc($db, "announcements", announcement.id);

    await updateDoc(docRef, {
      isActive: announcement.isActive, // <--- use the updated value directly
    });

    snackbarMessage.value = announcement.isActive
      ? "Announcement enabled"
      : "Announcement disabled";

    showSnackbar.value = true;
    fetchAnnouncements();
  } finally {
    togglingId.value = null;
  }
};
</script>

<style scoped>
.link {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}
.th {
  font-weight: 900;
}
</style>
