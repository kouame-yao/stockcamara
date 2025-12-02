import { UserID } from "@/app/types/tipage";
import { db } from "@/firebase/config/ficher-config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { PropsObjetvente } from "../components/card-ajout-autre-produit";

export interface PropsElementVente {
  voyage: number | string;
  chargeur: number | string;
  transport: number | string;
  uniteName: string;
  produitID: string;
  produitName: string;
  quantite: number | string;
  prix: number | string;
  total: number | string;
}

export interface PropsDataVentes {
  clientID: string;
  client: object;
  ventes: PropsElementVente[];
  status: string;
  createdAt: Date | string;
  totalGlobale: number | string;
  [key: string]: any;
}

export const useAddVente = () => {
  async function ajoutvente(data: PropsDataVentes) {
    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter la vente !");
      return;
    }

    try {
      const venteCollectionRef = collection(db, "user", UserID, "vente");

      const result = await runTransaction(db, async (transaction) => {
        // ✅ ÉTAPE 1: TOUTES LES LECTURES D'ABORD
        const lecturesPromises = data.ventes.map(async (vente) => {
          const produitRef = doc(
            db,
            "user",
            UserID,
            "products",
            vente.produitID
          );
          const stockRef = doc(db, "user", UserID, "stock", vente.produitID);

          const produitSnap = await transaction.get(produitRef);
          const stockSnap = await transaction.get(stockRef);

          return {
            vente,
            produitRef,
            stockRef,
            produitSnap,
            stockSnap,
          };
        });

        const lectures = await Promise.all(lecturesPromises);

        // ✅ ÉTAPE 2: VÉRIFICATIONS
        for (const lecture of lectures) {
          const { vente, produitSnap, stockSnap } = lecture;

          // Vérifier le produit
          if (!produitSnap.exists()) {
            throw new Error(`Produit ${vente.produitName} introuvable`);
          }

          const produitQuantite = Number(produitSnap.data().quantite);
          const nouvelleQuantiteProduit =
            produitQuantite - Number(vente.quantite);

          if (nouvelleQuantiteProduit < 0) {
            throw new Error(
              `Stock insuffisant pour ${vente.produitName}. Stock disponible: ${produitQuantite}, quantité demandée: ${vente.quantite}`
            );
          }

          // Vérifier le stock si existe
          if (stockSnap.exists()) {
            const stockQuantite = Number(stockSnap.data().quantite);
            const nouvelleQuantiteStock =
              stockQuantite - Number(vente.quantite);

            if (nouvelleQuantiteStock < 0) {
              throw new Error(
                `Stock insuffisant pour ${vente.produitName}. Stock disponible: ${stockQuantite}, quantité demandée: ${vente.quantite}`
              );
            }
          }
        }

        // ✅ ÉTAPE 3: TOUTES LES ÉCRITURES ENSUITE
        for (const lecture of lectures) {
          const { vente, produitRef, stockRef, produitSnap, stockSnap } =
            lecture;

          // Mettre à jour le produit
          const currentQuantiteProduit = Number(produitSnap?.data()?.quantite);
          const newQuantiteProduit =
            currentQuantiteProduit - Number(vente.quantite);

          transaction.update(produitRef, {
            quantite: newQuantiteProduit,
          });

          // Mettre à jour le stock si existe
          if (stockSnap.exists()) {
            const currentQuantiteStock = Number(stockSnap.data().quantite);
            const newQuantiteStock =
              currentQuantiteStock - Number(vente.quantite);

            transaction.update(stockRef, {
              quantite: newQuantiteStock,
            });
          }
        }

        // Créer le document de vente
        const newVenteRef = doc(venteCollectionRef);
        transaction.set(newVenteRef, {
          ...data,
          createdAt: new Date(),
        });

        return newVenteRef.id;
      });

      return { success: true, id: result };
    } catch (e: any) {
      toast.error("Erreur lors de l'enregistrement de la vente:" + e.message);
      throw e;
    }
  }

  return ajoutvente;
};

export const useModifierVente = () => {
  async function modifierVente(
    venteID: string,
    nouvellesDonnees: PropsDataVentes
  ) {
    if (!navigator.onLine) {
      toast.error("Pas de réseau, modification impossible !");
      return;
    }

    try {
      const venteRef = doc(db, "user", UserID, "vente", venteID);

      await runTransaction(db, async (transaction) => {
        // 🔹 1. Lecture de l'ancienne vente
        const ancienneVenteSnap = await transaction.get(venteRef);
        if (!ancienneVenteSnap.exists()) {
          throw new Error("Vente introuvable !");
        }

        const ancienneVente = ancienneVenteSnap.data() as PropsDataVentes;

        console.log("📦 Ancienne vente:", ancienneVente.ventes);
        console.log("🆕 Nouvelle vente:", nouvellesDonnees.ventes);

        // 🔹 2. Créer des Map pour faciliter les comparaisons
        // ✅ CORRECTION : Additionner les quantités si même produit apparaît plusieurs fois
        const anciensProduitsMap = new Map<string, number>();
        for (const v of ancienneVente.ventes) {
          const currentQty = anciensProduitsMap.get(v.produitID) || 0;
          anciensProduitsMap.set(v.produitID, currentQty + Number(v.quantite));
        }

        const nouveauxProduitsMap = new Map<string, number>();
        for (const v of nouvellesDonnees.ventes) {
          const currentQty = nouveauxProduitsMap.get(v.produitID) || 0;
          nouveauxProduitsMap.set(v.produitID, currentQty + Number(v.quantite));
        }

        console.log(
          "📊 Map anciens produits:",
          Object.fromEntries(anciensProduitsMap)
        );
        console.log(
          "📊 Map nouveaux produits:",
          Object.fromEntries(nouveauxProduitsMap)
        );

        // 🔹 3. Identifier tous les produits concernés (anciens + nouveaux)
        const tousLesProduitIDs = new Set([
          ...anciensProduitsMap.keys(),
          ...nouveauxProduitsMap.keys(),
        ]);

        console.log("🎯 Produits concernés:", Array.from(tousLesProduitIDs));

        // 🔹 4. ÉTAPE 1 : TOUTES LES LECTURES
        const lecturesPromises = Array.from(tousLesProduitIDs).map(
          async (produitID) => {
            const produitRef = doc(db, "user", UserID, "products", produitID);
            const stockRef = doc(db, "user", UserID, "stock", produitID);

            const produitSnap = await transaction.get(produitRef);
            const stockSnap = await transaction.get(stockRef);

            return {
              produitID,
              produitRef,
              stockRef,
              produitSnap,
              stockSnap,
            };
          }
        );

        const lectures = await Promise.all(lecturesPromises);

        // 🔹 5. ÉTAPE 2 : CALCULS ET VÉRIFICATIONS
        const operations: Array<{
          produitID: string;
          produitRef: any;
          stockRef: any;
          difference: number;
          produitSnap: any;
          stockSnap: any;
        }> = [];

        for (const lecture of lectures) {
          const { produitID, produitRef, stockRef, produitSnap, stockSnap } =
            lecture;

          if (!produitSnap.exists()) {
            throw new Error(
              `Produit ${
                nouvellesDonnees.ventes.find((v) => v.produitID === produitID)
                  ?.produitName || produitID
              } introuvable`
            );
          }

          const ancienneQuantite = anciensProduitsMap.get(produitID) || 0;
          const nouvelleQuantite = nouveauxProduitsMap.get(produitID) || 0;

          // 🔹 Calcul de la différence
          // Si différence > 0 → le client achète PLUS → on RETIRE du stock
          // Si différence < 0 → le client achète MOINS (ou supprimé) → on REMET dans le stock
          const difference = nouvelleQuantite - ancienneQuantite;

          console.log(
            `📊 Produit ${produitID}: ancienne=${ancienneQuantite}, nouvelle=${nouvelleQuantite}, diff=${difference}`
          );

          // Vérifier que le stock est suffisant si on retire
          if (difference > 0) {
            const produitQuantiteActuelle = Number(produitSnap.data().quantite);
            const nouvelleQuantiteProduit =
              produitQuantiteActuelle - difference;

            if (nouvelleQuantiteProduit < 0) {
              const produitName =
                nouvellesDonnees.ventes.find((v) => v.produitID === produitID)
                  ?.produitName || produitID;
              throw new Error(
                `Stock insuffisant pour ${produitName}. Disponible: ${produitQuantiteActuelle}T, besoin: ${difference}T supplémentaires`
              );
            }

            // Vérifier aussi le stock si existe
            if (stockSnap.exists()) {
              const stockActuel = Number(stockSnap.data().quantite);
              const nouvelleQuantiteStock = stockActuel - difference;

              if (nouvelleQuantiteStock < 0) {
                const produitName =
                  nouvellesDonnees.ventes.find((v) => v.produitID === produitID)
                    ?.produitName || produitID;
                throw new Error(
                  `Stock insuffisant pour ${produitName}. Stock disponible: ${stockActuel}T`
                );
              }
            }
          }

          operations.push({
            produitID,
            produitRef,
            stockRef,
            difference,
            produitSnap,
            stockSnap,
          });
        }

        // 🔹 6. ÉTAPE 3 : TOUTES LES ÉCRITURES
        for (const op of operations) {
          const {
            produitID,
            produitRef,
            stockRef,
            difference,
            produitSnap,
            stockSnap,
          } = op;

          // Si difference === 0, pas de changement, on skip
          if (difference === 0) {
            console.log(`⏭️ Produit ${produitID}: Aucun changement (diff=0)`);
            continue;
          }

          const produitName =
            nouvellesDonnees.ventes.find((v) => v.produitID === produitID)
              ?.produitName ||
            ancienneVente.ventes.find((v) => v.produitID === produitID)
              ?.produitName ||
            produitID;

          // Mettre à jour le produit
          const currentQuantiteProduit = Number(produitSnap.data().quantite);
          const newQuantiteProduit = currentQuantiteProduit - difference;

          console.log(`
🔄 PRODUIT: ${produitName} (${produitID})
   📊 Stock actuel: ${currentQuantiteProduit}T
   📈 Différence: ${difference}T
   ${
     difference > 0
       ? "⬇️ Action: RETIRER du stock (client achète PLUS)"
       : "⬆️ Action: REMETTRE dans le stock (client achète MOINS)"
   }
   🎯 Calcul: ${currentQuantiteProduit} - (${difference}) = ${newQuantiteProduit}T
   ✅ Nouveau stock: ${newQuantiteProduit}T
          `);

          transaction.update(produitRef, {
            quantite: Math.max(0, newQuantiteProduit),
          });

          // Mettre à jour le stock si existe
          if (stockSnap.exists()) {
            const currentQuantiteStock = Number(stockSnap.data().quantite);
            const newQuantiteStock = currentQuantiteStock - difference;

            console.log(`
   📦 STOCK GLOBAL:
      Actuel: ${currentQuantiteStock}T
      Calcul: ${currentQuantiteStock} - (${difference}) = ${newQuantiteStock}T
      Nouveau: ${newQuantiteStock}T
            `);

            transaction.update(stockRef, {
              quantite: Math.max(0, newQuantiteStock),
            });
          }
        }

        // 🔹 7. Mise à jour du document de vente
        transaction.update(venteRef, {
          ...nouvellesDonnees,
          updatedAt: new Date(),
        });

        console.log("✅ Transaction terminée avec succès");
      });

      toast.success("Vente modifiée avec succès !");
      return { success: true };
    } catch (e: any) {
      console.error("❌ Erreur:", e);
      toast.error(`Erreur lors de la modification: ${e.message}`);
      throw e;
    }
  }

  return modifierVente;
};

export const useDeleteVente = () => {
  const supprimerVente = async (venteID: string) => {
    try {
      // ✅ Étape 1 : Récupérer la vente
      const venteRef = doc(db, "user", UserID, "vente", venteID);
      const venteSnap = await getDoc(venteRef);

      if (!venteSnap.exists()) {
        toast.error("Vente introuvable !");
        return;
      }

      const venteData = venteSnap.data();
      const ventesProduits = venteData?.ventes || [];

      // ✅ Étape 2 : Réajuster les stocks
      for (const produit of ventesProduits) {
        const produitRef = doc(
          db,
          "user",
          UserID,
          "products",
          produit.produitID
        );
        const stockData = doc(db, "user", UserID, "stock", produit.produitID);
        const produitSnap = await getDoc(produitRef);

        if (produitSnap.exists()) {
          const produitData = produitSnap.data();
          const ancienneQuantite = Number(produitData?.quantite || 0);
          const nouvelleQuantite = ancienneQuantite + Number(produit.quantite);

          await updateDoc(produitRef, {
            quantite: nouvelleQuantite,
          });

          await updateDoc(stockData, {
            quantite: nouvelleQuantite,
          });

          console.log(
            `✅ Stock du produit "${produit.produitName}" mis à jour : ${ancienneQuantite} → ${nouvelleQuantite}`
          );
        }
      }

      // ✅ Étape 3 : Supprimer la vente
      await deleteDoc(venteRef);
      toast.success("Vente supprimée et stock réajusté !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression de la vente !");
    }
  };

  return supprimerVente;
};

// ajouter vente sable

export const useVenteAutre = () => {
  interface PropsDataVenteSable {
    type: string;
    client: object;
    clientID: string;
    createdAt: Date | null;
    totalGlobale: number | string;
    status: string;
    ventes: PropsObjetvente[];
  }
  async function AutreVente(data: PropsDataVenteSable) {
    if (!navigator.onLine) {
      toast.error("Veillez retablie la connexion");
      return;
    }
    try {
      await addDoc(collection(db, "user", UserID, "vente"), data);
      toast.success("Produit ajouter avec succes");
    } catch (error) {
      toast.error(`Erreur serveur:${error}`);
    }
  }
  return AutreVente;
};

export const useEdditAutre = () => {
  interface PropsDataVenteAutre {
    type: string;
    client: object;
    clientID: string;
    updatedAt: Date | null;
    totalGlobale: number | string;
    status: string;
    ventes: PropsObjetvente[];
  }

  async function AutreEddit(id: string, data: PropsDataVenteAutre) {
    if (!navigator.onLine) {
      toast.error("Veillez retablie la connexion");
      return;
    }
    const DocRef = doc(db, "user", UserID, "vente", id);

    try {
      await updateDoc(DocRef, { ...data });
      toast.success("Produit mis ajour avec succes");
    } catch (error) {
      toast.error(`Erreur serveur:${error}`);
    }
  }
  return AutreEddit;
};
