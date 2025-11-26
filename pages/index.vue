<template>
  <v-container fluid>
    <!-- Page Title -->
    <h1 class="text-h4 font-weight-bold mb-6">Dashboard</h1>

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
                >
                  View
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>

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
                >
                  View
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGetLostItems } from "~/composables/items/getLostItems";

const { getLostItems } = useGetLostItems();
const router = useRouter();

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

    // Group items into active (recent) and expired
    recentLostItems.value = data.filter((item) => {
      const expiry = item.expiryDate?.toDate?.();
      return (
        item.status !== "expired" && expiry && expiry > now // still within threshold
      );
    });

    expiredItems.value = data.filter((item) => {
      const expiry = item.expiryDate?.toDate?.();
      return (
        item.status !== "claimed" && expiry && expiry <= now // expired AND not claimed
      );
    });
  } catch (error) {
    console.error("Error fetching items:", error);
  } finally {
    loading.value = false;
  }
};

// run on client only
onMounted(() => fetchItems());

// redirect to edit page
const goToId = (id) => {
  router.push({
    path: `/items/${id}`,
    query: { mode: "edit" },
  });
};

// Stats
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

// For displaying timestamps (works for createdAt + expiryDate)
const formatTimestamp = (timestamp) => {
  if (!timestamp?.seconds) return "";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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
