"use client";
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PropsDataStock } from "./ajouter-stock";
interface PropsDataStockID extends PropsDataStock {
  id: string;
}
export function useGetlistestock() {
  const [stock, setStock] = useState<PropsDataStockID[]>([]);

  useEffect(() => {
    // Si UserID n'est pas encore défini, on ne fait rien
    if (!UserID) {
      console.warn("UserID manquant");
      return;
    }

    // Préparer la requête Firestore
    const produitsRef = collection(db, "user", UserID, "stock");
    const q = query(produitsRef);

    // Ecoute en temps réel
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liste: PropsDataStockID[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Casting pour s'assurer que tous les champs existent

        liste.push({
          id: doc.id,
          nom: data.nom || "",
          ProduitID: data.produitID || "",
          status: data.status || "",
          quantite: data.quantite ?? 0,
          emplacement: data.emplacement || "",
        });
      });
      setStock(liste);
    });

    // Nettoyage lors du démontage
    return () => unsubscribe();
  }, [UserID]); // <- dépend de UserID

  return stock;
}
