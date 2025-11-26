import { ref } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { useNuxtApp } from "#app";

export function useGetLostItems() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { $db } = useNuxtApp();

  const getLostItems = async () => {
    loading.value = true;
    error.value = null;

    try {
      const querySnapshot = await getDocs(collection($db, "lost_item"));

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,

          // Normalize fields for safety
          status: data.status ?? "pending",
          claimer: data.claimer || null,

          // Support expired date in UI
          expiredAt: data.expiredAt?.toDate?.() ?? null,
        };
      });
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { getLostItems, loading, error };
}
