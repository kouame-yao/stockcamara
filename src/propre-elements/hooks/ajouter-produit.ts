import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

export interface PropsDataProduit {
  nom: string;
  description: string;
  prix: string;
  categorie: string;
  status: boolean;
  quantite: number | string;
  emplacement: string;
  createdAt: Date | string;
}

export default function useAjouterProduit() {
  async function addProduct(productData: PropsDataProduit) {
    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter le produit !");
      return;
    }
    try {
      // 1️⃣ Créer le produit dans la collection products
      const productRef = await addDoc(
        collection(db, "user", UserID, "products"),
        {
          ...productData,
          UserID, // Ajout de l'userId pour lier le produit à l'utilisateur
          createdAt: new Date().toISOString(),
        }
      );

      // 2️⃣ Ajouter l'ID du produit dans la catégorie correspondante
      const categoryRef = doc(
        db,
        "user",
        UserID,
        "categorie",
        productData.categorie
      );

      await updateDoc(categoryRef, {
        status: true,
      });
      await updateDoc(categoryRef, {
        products: arrayUnion(productRef.id),
      });

      toast.success("Produit ajouté avec succès !");
      return;
    } catch (error) {
      toast.error("Erreur lors de l'ajout du produit:");
      throw error;
    }
  }

  return addProduct;
}

interface PropsidProduit extends PropsDataProduit {
  id: string;
}
export function useEditeproduit() {
  async function editedProduit(data: PropsidProduit) {
    try {
      const washingtonRef = doc(db, "user", UserID, "products", data.id);

      await updateDoc(washingtonRef, { ...data });

      toast.success("Modification effectué avec succès");
    } catch (error) {
      toast.error(`Erreur serveur: ${error}`);
    }
  }
  return editedProduit;
}

export function useDeletedproduit() {
  async function deletedProduit(id: string) {
    const refProduit = doc(db, "user", UserID, "products", id);
    const refStock = doc(db, "user", UserID, "stock", id);

    const snapShotProduit = await getDoc(refProduit);
    const snapShotstock = await getDoc(refStock);

    const categorieData = snapShotProduit.data();
    const categorieID = categorieData?.categorie;
    const produitLocal = categorieData?.emplacement;
    try {
      if (!snapShotProduit.exists()) {
        toast.error("Cet produit a déjà été supprimer ou introuvable");
        return;
      }
      if (!snapShotstock.exists() && produitLocal !== "") {
        toast.error(
          "Cet produit dans le stock a déjà été supprimer ou introuvable "
        );
        return;
      }

      if (!categorieID) {
        throw new Error("Ce produit n’a pas de catégorie liée.");
      }

      await deleteDoc(refProduit);
      await deleteDoc(refStock);
      const refCategorie = doc(
        db,
        "user",
        UserID,
        "categorie",
        String(categorieID)
      );

      const snapShotCategorie = await getDoc(refCategorie);
      const categorieproduitTable = snapShotCategorie.data()?.products;

      if ((categorieproduitTable.length = 1)) {
        await updateDoc(refCategorie, {
          status: false,
        });
      }

      await updateDoc(refCategorie, {
        products: arrayRemove(id),
      });
      toast.success("Produits supprimer avec succès");
    } catch (error) {
      toast.error(`Erreur detecter:${error}`);
    }
  }
  return deletedProduit;
}
