<template>
  <v-container>
    <v-row class="mb-4 align-center justify-space-between">
      <h1>Lost Items</h1>
      <v-btn color="primary" @click="goToAddItem"> + Add New Item </v-btn>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          placeholder="Search items..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="Filter by Status"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
    </v-row>

    <!-- {{ items?.[0]?.threshold }} -->

    <DataTable
      :headers="headers"
      :items="filteredItems"
      @delete="handleDelete"
      @toggle="handleToggle"
      @click:item="handleItemClick"
    />

    <ConfirmationDialog
      v-model="dialog"
      title="Delete Item"
      message="Are you sure you want to delete this item? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="dialog = false"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useGetLostItems } from "~/composables/items/getLostItems";
import { useDeleteLostItem } from "~/composables/items/deleteItem";
import { useUpdateLostItem } from "~/composables/items/updateItems";
const router = useRouter();

const { getLostItems } = useGetLostItems();
const { deleteLostItem } = useDeleteLostItem();
const { updateLostItem } = useUpdateLostItem();
const search = ref("");
const statusFilter = ref("");
const dialog = ref(false);
const selectedItem = ref<any>(null);
const statusOptions = ["claimed", "pending"];

const headers = [
  { title: "Item Name", key: "name" },
  { title: "Posted On", key: "createdOn" },
  { title: "Posted By", key: "email" },
  { title: "Status", key: "status" },
  { title: "Threshold", key: "threshold" },

  { title: "Actions", key: "actions", sortable: false },
];

const items = ref<any[]>([]);

const fetchItems = async () => {
  const data = await getLostItems();

  items.value = data.map((doc: any) => ({
    id: doc.id,
    name: doc.itemName,
    email: doc.contactEmail,
    createdOn: doc.createdAt?.toDate?.()?.toLocaleDateString() ?? "",
    status: doc.status,
    threshold: doc.threshold || "—",
    isEnabled: doc.isEnabled ?? false,
  }));

  console.log("Items:", items.value);
};

// const items = ref([
//   {
//     id: 1,
//     name: "Laptop",
//     createdOn: "2025-08-20",
//     email: "user1@example.com",
//     status: "claimed",
//     threshold: "2 Weeks",
//     isEnabled: false,
//   },
//   {
//     id: 2,
//     name: "Bag",
//     createdOn: "2025-08-18",
//     email: "user2@example.com",
//     status: "pending",
//     threshold: "1 Month",
//     isEnabled: false,
//   },
//   {
//     id: 3,
//     name: "Watch",
//     createdOn: "2025-08-15",
//     email: "user3@example.com",
//     threshold: "3 Weeks",
//     status: "pending",
//     isEnabled: true,
//   },
// ]);

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search?.value?.toLowerCase());
    const matchesStatus = statusFilter.value
      ? item.status === statusFilter.value
      : true;
    return matchesSearch && matchesStatus;
  });
});

onMounted(() => {
  fetchItems();
});

const handleDelete = (item: any) => {
  console.log("Delete clicked for:", item);
  selectedItem.value = item; // store the clicked item
  dialog.value = true; // ✅ open dialog
};

const confirmDelete = async () => {
  if (!selectedItem.value) return;
  try {
    await deleteLostItem(selectedItem.value.id); // ✅ Firestore delete
    items.value = items.value.filter((i) => i.id !== selectedItem.value.id);
    console.log("Deleted:", selectedItem.value);
  } catch (err) {
    console.error("❌ Error deleting item:", err);
  } finally {
    dialog.value = false; // close dialog
    selectedItem.value = null;
  }
};

const handleToggle = async (item: any) => {
  try {
    // item.isEnabled = !item.isEnabled; // optimistic UI update
    await updateLostItem(item.id, { isEnabled: item.isEnabled });
    console.log("✅ isEnabled updated:", item);
  } catch (err) {
    console.error("❌ Failed to update isEnabled:", err);
    // rollback if failed
    item.isEnabled = !item.isEnabled;
  }
};

const goToAddItem = () => {
  router.push({
    path: "/items/new",
    query: { mode: "add" },
  });
};

const handleItemClick = (item: any) => {
  router.push({
    path: `/items/${item.id}`,
    query: { mode: "edit" },
  });
};
</script>
