import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

export interface PropsDataStock {
  id: string;
  ProduitID: string;
  nom: string;
  quantite: number | string;
  emplacement: string;
  status: string;
}

export default function useAjouterStock() {
  const stock = async (data: PropsDataStock) => {
    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter le stock !");
      return;
    }
    try {
      // Référence au document stock
      const sfDocStock = doc(collection(db, "user", UserID, "stock"), data.id);

      // On récupère le document pour savoir s'il existe
      const stockSnap = await getDoc(sfDocStock); // optionnel, sinon tu peux directement set avec merge
      if (stockSnap.exists()) {
        // Si le doc existe, on met à jour
        await updateDoc(sfDocStock, {
          produitID: data.id,
          nom: data.nom,
          quantite: data.quantite,
          emplacement: data.emplacement,
          status: data.status,
        });
      } else {
        // Sinon, on crée le doc avec merge=true pour ne pas écraser autre chose
        await setDoc(
          sfDocStock,
          {
            produitID: data.id,
            nom: data.nom,
            quantite: data.quantite,
            emplacement: data.emplacement,
            status: data.status,
          },
          { merge: true }
        );
      }

      // // Mise à jour du produit
      // const sfDocProduit = doc(db, "user", UserID, "products", data.id);
      // await updateDoc(sfDocProduit, {
      //   quantite: data.quantite,
      //   emplacement: data.emplacement,
      // });

      toast.success("Stock ajouté ou mis à jour !");
    } catch (e) {
      toast.error(`Erreur ajout/mise à jour stock : ${e}`);
    }
  };

  return stock;
}
interface PropsDataIdstock extends PropsDataStock {
  id: string;
}
export function useEditestock() {
  async function editedStock(data: PropsDataIdstock) {
    try {
      const washingtonRef = doc(db, "user", UserID, "stock", data.id);
      const snapDocProduit = doc(
        db,
        "user",
        UserID,
        "products",
        data.ProduitID
      );

      await updateDoc(washingtonRef, {
        emplacement: data.emplacement,
        status: data.status,
      });

      await updateDoc(snapDocProduit, {
        emplacement: data.emplacement,
      });

      toast.success("Modification effectué avec succès");
    } catch (error) {
      toast.error(`Erreur serveur: ${error}`);
    }
  }
  return editedStock;
}

export function useDeletedstock() {
  async function deletedStock(id: string) {
    const ref = doc(db, "user", UserID, "stock", id);
    const refProducts = doc(db, "user", UserID, "products", id);
    const snapShot = await getDoc(ref);
    const snapShotProducts = await getDoc(refProducts);

    const docPro = snapShotProducts.data();
    try {
      if (!snapShot.exists()) {
        toast.error("Cet stock a déjà été supprimer");
        return;
      }

      if (snapShotProducts.exists() && docPro?.quantite > 0) {
        toast.error(
          "Se stock contient des quantités . supprimer le produit lier au stock  ! "
        );
        return;
      }
      await deleteDoc(ref);
      toast.success("stock supprimer avec succès");
    } catch (error) {
      toast.error(`Erreur detecter:${error}`);
    }
  }
  return deletedStock;
}
