import { ref } from "vue";
import { doc, updateDoc } from "firebase/firestore";
import { useNuxtApp } from "#app";

export function useUpdateLostItem() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { $db } = useNuxtApp();

  const updateLostItem = async (
    id: string,
    updates: Partial<{
      itemName: string;
      description: string;
      location: string;
      contactEmail: string;
      image?: string | null;
      category: string;
      status: string;
    }>
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc($db, "lost_item", id);
      await updateDoc(docRef, updates);
      return true;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { updateLostItem, loading, error };
}
