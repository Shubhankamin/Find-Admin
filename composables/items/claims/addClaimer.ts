import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNuxtApp, useCookie } from "#app";

export const useLostItems = () => {
  const { $db } = useNuxtApp();

  const addClaimer = async (itemId: string, claimer: any) => {
    const itemRef = doc($db, "lost_item", itemId);

    await updateDoc(itemRef, {
      status: "claimed", // update status
      claimer: {
        ...claimer,
        claimedAt: serverTimestamp(),
        addedBy: useCookie("user").value.uid,
      },
    });
  };

  return { addClaimer };
};
