import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
export interface PropsDatafournisseur {
  nom: string;
  email: string;
  telephone: number | string;
  adresse: string;
  createdAt: string | Date;
  [key: string]: any;
}
export function useAddfournisseur() {
  async function fournisseur(data: PropsDatafournisseur) {
    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter le fournisseur !");
      return;
    }
    const docRef = await addDoc(
      collection(db, "user", UserID, "fournisseur"),
      data
    );
    toast.success("fournisseur ajouté avec succès");
  }
  return fournisseur;
}

export function useEditefournisseur() {
  async function editedFournisseur(data: PropsDatafournisseur) {
    try {
      const washingtonRef = doc(db, "user", UserID, "fournisseur", data.id);

      await updateDoc(washingtonRef, { ...data });

      toast.success("Modification effectué avec succès");
    } catch (error) {
      toast.error(`Erreur serveur: ${error}`);
    }
  }
  return editedFournisseur;
}

export function useDeletedfournisseur() {
  async function deletedFournisseur(id: string) {
    const ref = doc(db, "user", UserID, "fournisseur", id);
    const snapShot = await getDoc(ref);
    try {
      if (!snapShot.exists()) {
        toast.error("Cette commande a déjà été supprimer");
        return;
      }
      await deleteDoc(ref);
      toast.success("Commande supprimer avec succès");
    } catch (error) {
      toast.error(`Erreur detecter:${error}`);
    }
  }
  return deletedFournisseur;
}
