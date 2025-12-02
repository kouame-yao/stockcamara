import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
export interface devisClient {
  nom: string;
  telephone: string;
  adresse: string;
  email: string;
}
export interface devisProduct {
  designation: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}
export interface PropsDataDevis {
  id?: string;
  client: devisClient;
  devis: devisProduct[];
  reference?: string;
  totalHT: number;
  createdAt: Date;
}
export default function useAddDevis() {
  async function ajouterDevis(data: PropsDataDevis) {
    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter le devis !");
      return;
    }
    try {
      await addDoc(collection(db, "user", UserID, "devis"), data);

      toast.success(`devis enregistrer avec succes ${data.reference}  `);
    } catch (error) {
      toast.error(`Erreur du serveur:${error}`);
    }
  }
  return ajouterDevis;
}

export function useEditeDevis() {
  async function editedDevis(data: PropsDataDevis) {
    if (!data?.id) {
      return;
    }
    try {
      const washingtonRef = doc(db, "user", UserID, "devis", data?.id);

      await updateDoc(washingtonRef, { ...data });

      toast.success("Modification effectué avec succès");
    } catch (error) {
      toast.error(`Erreur serveur: ${error}`);
    }
  }
  return editedDevis;
}

export function useDeletedDevis() {
  async function deletedDevis(id: string) {
    const refDevis = doc(db, "user", UserID, "devis", id);

    try {
      await deleteDoc(refDevis);

      toast.success("Devis supprimer avec succès");
    } catch (error) {
      toast.error(`Erreur detecter:${error}`);
    }
  }
  return deletedDevis;
}
