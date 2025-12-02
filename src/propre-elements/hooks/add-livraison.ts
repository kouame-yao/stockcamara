import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

export interface PropsDataLivraison {
  produitID: string;
  CommandeID: string;
  produit: string;
  fournisseur: string;
  quantite: number | string;
  prixUnitaire: number | string;
  moyenTransport: string;
  prixTransport: number | string;
  emplacement: string;
  total: number;
  createdAt: Date | null;
}

export default function useAjoutLivraison() {
  const addLivraison = async (data: PropsDataLivraison) => {
    // Vérifier que les IDs ne sont pas vides

    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter la livraison !");
      return;
    }

    if (!data.CommandeID || !data.produitID) {
      console.error("CommandeID ou produitID manquant");
      return;
    }

    // ✅ Calculer le total : prixUnitaire * quantite + prixTransport
    const quantite = Number(data.quantite) || 0;
    const prixUnitaire = Number(data.prixUnitaire) || 0;
    const prixTransport = Number(data.prixTransport) || 0;
    const totalCalcule = quantite * prixUnitaire + prixTransport;

    // Préparer les données avec le total calculé
    const dataAvecTotal = {
      ...data,
      total: totalCalcule,
      quantite: quantite,
      prixUnitaire: prixUnitaire,
      prixTransport: prixTransport,
    };

    // Référence à la collection Livraison
    const livraisonCollection = collection(db, "user", UserID, "Livraison");

    const sfDocCommande = doc(db, "user", UserID, "commande", data.CommandeID);
    const sfDocProduit = doc(db, "user", UserID, "products", data.produitID);
    const sfDocStock = doc(db, "user", UserID, "stock", data.produitID);

    try {
      // Créer un nouveau document avec ID auto-généré
      const newLivraisonRef = doc(livraisonCollection);

      await runTransaction(db, async (transaction) => {
        // Vérifier que les documents existent avant de les mettre à jour
        const commandeDoc = await transaction.get(sfDocCommande);
        const produitDoc = await transaction.get(sfDocProduit);
        const stockDoc = await transaction.get(sfDocStock);

        if (!commandeDoc.exists()) {
          throw new Error(`Commande ${data.CommandeID} n'existe pas`);
        }

        if (!produitDoc.exists()) {
          throw new Error(`Produit ${data.produitID} n'existe pas`);
        }

        // ✅ Récupérer la quantité actuelle du produit
        const quantiteProduitActuelle = Number(
          produitDoc.data()?.quantite || 0
        );

        // ✅ Récupérer la quantité actuelle du stock (si elle existe)
        const quantiteStockActuelle = stockDoc.exists()
          ? Number(stockDoc.data()?.quantite || 0)
          : 0;

        // ✅ Calculer les nouvelles quantités (addition au lieu de remplacement)
        const nouvelleQuantiteProduit = quantiteProduitActuelle + quantite;
        const nouvelleQuantiteStock = quantiteStockActuelle + quantite;

        // ✅ Créer le nouveau document de livraison avec le total calculé
        transaction.set(newLivraisonRef, dataAvecTotal);

        // Mettre à jour la commande
        transaction.update(sfDocCommande, {
          quantite: quantite,
          status: true,
        });

        // ✅ Mettre à jour ou créer le stock avec ADDITION de la quantité
        if (stockDoc.exists()) {
          transaction.update(sfDocStock, {
            quantite: nouvelleQuantiteStock,
          });
        } else {
          transaction.set(sfDocStock, {
            quantite: nouvelleQuantiteStock,
            produitID: data.produitID,
          });
        }

        // ✅ Mettre à jour le produit avec ADDITION de la quantité
        transaction.update(sfDocProduit, {
          quantite: nouvelleQuantiteProduit,
          emplacement: data.emplacement,
          status: true,
        });
      });

      toast.success("Livraison ajoutée avec succès");
    } catch (e) {
      toast.error("Erreur lors de l'ajout de la livraison:" + e);
    }
  };

  return addLivraison;
}

interface Propsidlivraison extends PropsDataLivraison {
  id: string;
}
export function useEditedLivraison() {
  async function editedLivraison(data: Propsidlivraison) {
    try {
      const washingtonRef = doc(db, "user", UserID, "Livraison", data.id);

      await updateDoc(washingtonRef, { ...data });

      toast.success("Modification effectué avec succè");
    } catch (error) {
      toast.error(`Erreur serveur: ${error}`);
    }
  }
  return editedLivraison;
}

export function useDeletedlivraison() {
  async function deletedLivraison(id: string) {
    const ref = doc(db, "user", UserID, "Livraison", id);
    const snapShot = await getDoc(ref);
    try {
      if (!snapShot.exists()) {
        toast.error("Cette livraison a déjà été supprimer");
        return;
      }
      await deleteDoc(ref);
      toast.success("Livraison supprimer avec succès");
    } catch (error) {
      toast.error(`Erreur detecter:${error}`);
    }
  }
  return deletedLivraison;
}
