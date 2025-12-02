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
export interface PropsDataCommande {
  produit: string;
  produitID: string;
  fournisseur: string;
  fournisseurID: string;
  createdAt: Date;
  commantaire: string;
  quantite: number | string;
  status: boolean;
}
export default function useAddcommande() {
  async function ajoutcommande(data: PropsDataCommande) {
    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter la commande !");
      return;
    }
    try {
      const docRef = await addDoc(
        collection(db, "user", UserID, "commande"),
        data
      );
      // toast.success(`Commande du produit ${data.produit} ajouter avec succès `);
    } catch (error) {
      // toast.error(`Erreur du serveur:${error}`);
    }
  }
  return ajoutcommande;
}

// hooks de modification
interface PropsidCommande extends PropsDataCommande {
  id: string;
}
export function useEditecommande() {
  async function editedCommande(data: PropsidCommande) {
    try {
      const washingtonRef = doc(db, "user", UserID, "commande", data.id);

      await updateDoc(washingtonRef, { ...data });

      toast.success("Modification effectué avec succès");
    } catch (error) {
      toast.error(`Erreur serveur: ${error}`);
    }
  }
  return editedCommande;
}

export function useDeletedcommande() {
  async function deletedCommande(id: string) {
    const refCommande = doc(db, "user", UserID, "commande", id);
    const snapShot = await getDoc(refCommande);
    try {
      if (!snapShot.exists()) {
        toast.error("Cette commande a déjà été supprimer");
        return;
      }
      await deleteDoc(refCommande);
      toast.success("Commande supprimer avec succès");
    } catch (error) {
      toast.error(`Erreur detecter:${error}`);
    }
  }
  return deletedCommande;
}
