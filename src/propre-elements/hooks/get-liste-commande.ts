"use client";
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PropsDataCommande } from "./add-commande";

export function useGetlistecommande() {
  interface CommandeAvecId extends PropsDataCommande {
    id: string;
  }
  const [Getcommande, setCommande] = useState<CommandeAvecId[]>([]);

  useEffect(() => {
    // Si UserID n'est pas encore défini, on ne fait rien
    if (!UserID) {
      console.warn("UserID manquant");
      return;
    }

    // Préparer la requête Firestore
    const produitsRef = collection(db, "user", UserID, "commande");
    const q = query(produitsRef, orderBy("createdAt", "desc"));

    // Ecoute en temps réel
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liste: CommandeAvecId[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Casting pour s'assurer que tous les champs existent
        liste.push({
          id: doc.id,
          produit: data.produit || "",
          produitID: data.produitID || "",
          fournisseur: data.fournisseur || "",
          fournisseurID: data.fournisseurID || "",
          createdAt: data.createdAt || null,
          commantaire: data.commantaire || "",
          quantite: data.quantite || "",
          status: data.status !== undefined ? data.status : false,
        });
      });
      setCommande(liste);
    });

    // Nettoyage lors du démontage
    return () => unsubscribe();
  }, [UserID]); // <- dépend de UserID

  return Getcommande;
}
