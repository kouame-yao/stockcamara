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

export interface PropsDataCategorie {
  nom: string;
  description: string;
  status: boolean | "";
  createdAt: Date | null;
}
export default function useAjoutcategie() {
  async function AddCategorie(data: PropsDataCategorie) {
    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter la catégorie !");
      return;
    }
    try {
      const docRef = await addDoc(
        collection(db, "user", UserID, "categorie"), // 👈 sous-collection ici
        data
      );
      toast.success(`La catégorie ${data.nom} ajouter avec succès`);
    } catch (e) {
      toast.error(`Erreur lors de l’ajout : ${e}`);
    }
  }
  return AddCategorie;
}

interface PropsidCategorie extends PropsDataCategorie {
  id: string;
}
export function useEditecategorie() {
  async function editedCategorite(data: PropsidCategorie) {
    try {
      const washingtonRef = doc(db, "user", UserID, "categorie", data.id);

      await updateDoc(washingtonRef, { ...data });

      toast.success("Modification effectué avec succè");
    } catch (error) {
      toast.error(`Erreur serveur: ${error}`);
    }
  }
  return editedCategorite;
}

export function useDeletedcategorie() {
  async function deletedcategorie(id: string) {
    const refcategrorie = doc(db, "user", UserID, "categorie", id);

    const getcat = await getDoc(refcategrorie);
    const data = getcat.data()?.products;
    toast.info(data);
    try {
      if (getcat.exists() && !data?.length) {
        toast.info(
          "Pour supprimer cette catégorie veillez supprimer les produits qui sont associer "
        );
        return;
      }

      await deleteDoc(refcategrorie);

      toast.success("Catégorie supprimer avec succès");
    } catch (error) {
      toast.error(`Erreur detecter:${error}`);
    }
  }
  return deletedcategorie;
}
