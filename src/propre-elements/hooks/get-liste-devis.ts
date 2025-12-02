import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PropsDataDevis } from "./ajouter-devis";

interface idPropsDataDevis extends PropsDataDevis {
  id: string;
}
export function useGetDevis() {
  const [devis, setDevis] = useState<idPropsDataDevis[]>([]);

  useEffect(() => {
    // Si UserID n'est pas encore défini, on ne fait rien
    if (!UserID) {
      console.warn("UserID manquant");
      return;
    }

    // Préparer la requête Firestore

    const produitsRef = collection(db, "user", UserID, "devis");
    const q = query(produitsRef, orderBy("createdAt", "desc"));

    // Ecoute en temps réel
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liste: idPropsDataDevis[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Casting pour s'assurer que tous les champs existent

        liste.push({
          id: doc.id,
          client: data.client || "",
          devis: data.devis || "",
          reference: data.reference || "",
          totalHT: data.totalHT || "",
          createdAt: data.createdAt || "",
        });
      });
      setDevis(liste);
    });
    // Nettoyage lors du démontage
    return () => unsubscribe();
  }, [UserID]); // <- dépend de UserID

  return devis;
}
