"use client";
import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PropsDataClient } from "./add-client";
export interface PropsDataClientID extends PropsDataClient {
  id: string;
}
export function useGetlisteclient() {
  const [lordingClient, setLordingClient] = useState(false);
  const [client, setClient] = useState<PropsDataClientID[]>([]);

  useEffect(() => {
    // Si UserID n'est pas encore défini, on ne fait rien
    if (!UserID) {
      console.warn("UserID manquant");
      return;
    }

    // Préparer la requête Firestore
    const produitsRef = collection(db, "user", UserID, "client");
    const q = query(produitsRef, orderBy("createdAt", "desc"));

    // Ecoute en temps réel
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const liste: PropsDataClientID[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Casting pour s'assurer que tous les champs existent

        liste.push({
          id: doc.id,
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          telephone: data.telephone ?? 0,
          adresse: data.adresse || "",
          createdAt: data.createdAt || "",
        });
      });
      setClient(liste);
    });

    // Nettoyage lors du démontage
    return () => unsubscribe();
  }, [UserID]); // <- dépend de UserID

  return client;
}
