import { doc, getDoc } from "firebase/firestore";
import { useNuxtApp } from "#app";

export function useGetOneLostItem() {
  const { $db } = useNuxtApp();

  const getOneLostItem = async (id: string) => {
    const docRef = doc($db, "lost_item", id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    } else {
      throw new Error("Item not found");
    }
  };

  return { getOneLostItem };
}
