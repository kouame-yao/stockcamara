"use client";
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

export interface PropsObejtproduit {
  id: string;
  nom: string;
  description: string;
  prix: string;
  categorie: string;
  status: string | boolean;
  quantite: number | string;
  emplacement: string;
  createdAt?: Date | null;
}
export function useListeProduit() {
  const [produits, setProduits] = useState<PropsObejtproduit[]>([]);

  useEffect(() => {
    if (!UserID) {
      console.warn("UserID manquant");
      return;
    }

    const produitsRef = collection(db, "user", UserID, "products");
    const q = query(produitsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste: PropsObejtproduit[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nom: data.nom || "",
          description: data.description || "",
          prix: data.prix || "",
          categorie: data.categorie || "",
          status: data.status,
          quantite: data.quantite ?? 0, // nombre par défaut 0
          emplacement: data.emplacement || "", // chaîne vide par défaut
        };
      });
      setProduits(liste);
    });

    return () => unsubscribe();
  }, [UserID]);

  return produits;
}
