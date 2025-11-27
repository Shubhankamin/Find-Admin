// ~/composables/items/deleteItem.ts
import { ref } from "vue";
import { doc, deleteDoc } from "firebase/firestore";
import { useNuxtApp } from "#app";

export function useDeleteLostItem() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { $db } = useNuxtApp();

  const deleteLostItem = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc($db, "lost_item", id);
      await deleteDoc(docRef);
      console.log("✅ Deleted item with ID:", id);
      return true;
    } catch (err: any) {
      error.value = err.message;
      console.error("❌ Error deleting item:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { deleteLostItem, loading, error };
}
