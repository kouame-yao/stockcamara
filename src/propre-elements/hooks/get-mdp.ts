// hook useGetMdp.ts
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export interface MdpItem {
  nom: string;
  mdp: string; // ou le champ que tu stockes
  [key: string]: any;
}

export default function useGetMdp() {
  const [mdp, setMdp] = useState<MdpItem | null>(null);

  useEffect(() => {
    if (!UserID) return;

    async function fetchMdp() {
      try {
        const docRef = doc(db, "user", UserID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMdp(docSnap.data().mdp);
        } else {
          console.warn("Document non trouvé pour cet userId :" + UserID);
        }
      } catch (error) {
        console.error("Erreur récupération mdp :" + error);
      }
    }

    fetchMdp();
  }, [UserID]);

  return mdp;
}
