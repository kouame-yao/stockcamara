"use client";
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface Categorie {
  id: string;
  nom: string;
  description: string;
  products: [];
  status: boolean;
  createdAt: string;
}

export function useListeCategorie() {
  const [categories, setCategories] = useState<Categorie[]>([]);

  useEffect(() => {
    const q = query(collection(db, "user", UserID, "categorie"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liste: Categorie[] = [];
      querySnapshot.forEach((doc) => {
        // on récupère chaque document avec son ID
        liste.push({ id: doc.id, ...doc.data() } as Categorie);
      });
      setCategories(liste);
    });

    // nettoyage lors du démontage du composant
    return () => unsubscribe();
  }, []);

  return categories;
}

export function useGetCatProduc() {
  async function GetProduitAssocier(ids: string[]) {
    if (!ids) {
      console.warn(
        "Impossible de récupérer les produits : categoryId est undefined"
      );
      return [];
    }

    const q = query(
      collection(db, "user", UserID, "products"),
      where("__name__", "in", ids)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  return GetProduitAssocier;
}
