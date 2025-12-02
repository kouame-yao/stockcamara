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
export interface PropsDataClient {
  nom: string;
  prenom: string;
  email: string;
  telephone: number | string;
  adresse: string;
  createdAt: null | string | Date;
}
export default function useAddclient() {
  async function addclient(data: PropsDataClient) {
    // Add a new document in collection "client"
    if (!navigator.onLine) {
      toast.error("Pas de réseaux impossible d'ajouter le client !");
      return;
    }
    try {
      const result = await addDoc(
        collection(db, "user", UserID, "client"),
        data
      );
      toast.success(`Le client ${data.nom} ajouter avec succès`);
      console.log(result.id);
    } catch (error) {
      toast.error(`Erreur du serveur:${error}`);
    }
  }

  return addclient;
}

// hooks de modification
interface PropsidClient extends PropsDataClient {
  id: string;
}
export function useEditeclient() {
  async function editedClient(data: PropsidClient) {
    try {
      const washingtonRef = doc(db, "user", UserID, "client", data.id);

      await updateDoc(washingtonRef, { ...data });

      toast.success("Modification effectué avec succès");
    } catch (error) {
      toast.error(`Erreur serveur: ${error}`);
    }
  }
  return editedClient;
}

// hook supprimer client

export function useDeletedclient() {
  async function deletedclient(id: string) {
    try {
      await deleteDoc(doc(db, "user", UserID, "client", id));
      toast.success("Client supprimer avec succès");
    } catch (error) {
      toast.error(`Erreur detecter:${error}`);
    }
  }
  return deletedclient;
}
