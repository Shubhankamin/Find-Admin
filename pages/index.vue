<template>
  <v-container fluid>
    <!-- Page Title -->
    <h1 class="text-h4 font-weight-bold mb-6">Dashboard</h1>

    <!-- Top Stats Section -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="3">
          <v-icon size="32" color="primary" class="mb-2"
            >mdi-package-variant</v-icon
          >
          <h3 class="text-h5 font-weight-bold">Total Lost Items</h3>
          <p class="text-h6 mt-2">{{ totalLost }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="3">
          <v-icon size="32" color="success" class="mb-2"
            >mdi-check-circle</v-icon
          >
          <h3 class="text-h5 font-weight-bold">Claimed Items</h3>
          <p class="text-h6 mt-2">{{ claimedCount }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="3">
          <v-icon size="32" color="error" class="mb-2">mdi-alert</v-icon>
          <h3 class="text-h5 font-weight-bold">Pending Items</h3>
          <p class="text-h6 mt-2">{{ pendingCount }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recently Lost Items -->
    <h2 class="text-h5 font-weight-bold my-6">Recently Lost Items</h2>

    <v-card elevation="3">
      <v-table>
        <thead>
          <tr class="bg-grey">
            <th class="text-left heading font-bold" style="font-weight: bold">
              Item Name
            </th>
            <th class="text-left heading" style="font-weight: bold">
              Location
            </th>
            <th class="text-left heading" style="font-weight: bold">Status</th>
            <th class="text-left heading" style="font-weight: bold">
              Posted On
            </th>
            <th class="text-left heading" style="font-weight: bold">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in recentLostItems" :key="i">
            <td @click="goToId(item?.id)" class="link">{{ item.itemName }}</td>
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
    </v-card>
  </v-container>
</template>

<script setup>
import { useGetLostItems } from "~/composables/items/getLostItems";

const { getLostItems } = useGetLostItems();
const router = useRouter();
const stats = {
  totalLostItems: 120,
  claimedItems: 45,
  pendingItems: 75,
};

const id = ref();
const recentLostItems = ref();
const fetchItems = async () => {
  const data = await getLostItems();
  recentLostItems.value = data;
  id.value = data?.id;
  console.log(recentLostItems.value, "Items");

  console.log(recentLostItems.value.length, "Count");
  console.log(id.value, "id");

  console.log("Recent Items:", data);
};

const goToId = (id) => {
  router.push({
    path: `/items/${id}`,
    query: { mode: "edit" },
  });
};

const totalLost = computed(() => recentLostItems.value?.length || 0);
const claimedCount = computed(() => {
  return recentLostItems.value?.filter((item) => item.status === "claimed")
    .length;
});
const pendingCount = computed(() => {
  return recentLostItems.value?.filter((item) => item.status === "pending")
    .length;
});
const formatTimestamp = (timestamp) => {
  if (!timestamp?.seconds) return "";

  const date = new Date(timestamp.seconds * 1000);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

onMounted(() => {
  fetchItems();
});

// const recentLostItems = [
//   {
//     id: 1,
//     name: "Black Wallet",
//     location: "Central Park",
//     status: "Pending",
//     postedOn: "2025-08-15",
//     image: "/images/wallet.jpg",
//   },
//   {
//     id: 2,
//     name: "Blue Backpack",
//     location: "City Mall",
//     status: "Claimed",
//     postedOn: "2025-08-14",
//     image: "/images/backpack.jpg",
//   },
//   {
//     id: 3,
//     name: "Smartphone",
//     location: "Train Station",
//     status: "Pending",
//     postedOn: "2025-08-13",
//     image: "/images/phone.jpg",
//   },
// ];
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
