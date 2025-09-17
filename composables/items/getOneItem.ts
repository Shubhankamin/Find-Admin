import { doc, getDoc } from "firebase/firestore"; // ✅ Import these
import { useNuxtApp } from "#app";
export function useGetOneLostItem() {
  const { $db } = useNuxtApp();

  const getOneLostItem = async (id: string) => {
    const docRef = doc($db, "lost_item", id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        claimer: data.claimer || null, // ensure claimer field exists
      };
    } else {
      throw new Error("Item not found");
    }
  };

  return { getOneLostItem };
}
