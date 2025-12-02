// hook/get-liste-ventes.ts
"use client";
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function useGetListeVentes(): any[] {
  const [ventes, setVentes] = useState<any[]>([]);

  useEffect(() => {
    // ✅ Référence à la collection "vente"
    const colRef = collection(db, "user", UserID, "vente");
    const q = query(colRef, orderBy("createdAt", "desc"));
    // ✅ Abonnement temps réel
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      setVentes(data);
    });

    // ✅ Nettoyage : désabonne quand le composant se démonte
    return () => unsubscribe();
  }, []);

  return ventes;
}
