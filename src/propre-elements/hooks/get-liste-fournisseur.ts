"use client";
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PropsDatafournisseur } from "./add-fournisseur";

export function useGetlistefournisseur() {
  interface fournisseurAvecId extends PropsDatafournisseur {
    id: string;
  }
  const [Getfournisseur, setfournisseur] = useState<fournisseurAvecId[]>([]);

  useEffect(() => {
    // Si UserID n'est pas encore défini, on ne fait rien
    if (!UserID) {
      console.warn("UserID manquant");
      return;
    }

    // Préparer la requête Firestore
    const produitsRef = collection(db, "user", UserID, "fournisseur");
    const q = query(produitsRef);

    // Ecoute en temps réel
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liste: fournisseurAvecId[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Casting pour s'assurer que tous les champs existent
        liste.push({
          id: doc.id,
          nom: data.nom || "",
          email: data.email || "",
          adresse: data.adresse || "", // <- corriger ici
          telephone: data.telephone || "",
          createdAt: data.createdAt || "", // <- corriger ici
        });
      });
      setfournisseur(liste);
    });

    // Nettoyage lors du démontage
    return () => unsubscribe();
  }, [UserID]); // <- dépend de UserID

  return Getfournisseur;
}
