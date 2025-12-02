"use client";
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PropsDataLivraison } from "./add-livraison";

export interface PropsDataLivraisonId extends PropsDataLivraison {
  id: string;
}

export function useGetlistelivraison() {
  const [livraison, setLivraison] = useState<PropsDataLivraisonId[]>([]);

  useEffect(() => {
    if (!UserID) {
      console.warn("UserID manquant");
      return;
    }

    const produitsRef = collection(db, "user", UserID, "Livraison");
    const q = query(produitsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste: PropsDataLivraisonId[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          produitID: data.produitID || "",
          CommandeID: data.CommandeID || "",
          produit: data.produit || "",
          fournisseur: data.fournisseur || "",
          prixUnitaire: data.prixUnitaire ?? 0,
          prixTransport: data.prixTransport ?? 0,
          moyenTransport: data.moyenTransport || "",
          total: data.total ?? 0,
          quantite: data.quantite ?? 0,
          emplacement: data.emplacement || "",
          createdAt: data.createdAt,
        };
      });
      setLivraison(liste);
    });

    return () => unsubscribe();
  }, [UserID]);

  return livraison;
}
