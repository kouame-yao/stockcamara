"use client";
import Calendrier from "@/components/calendrier";
import { InputDemo } from "@/components/input";
import { TextareaDemo } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDate } from "@internationalized/date";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CiRedo } from "react-icons/ci";
import { toast } from "react-toastify";
import { PropsDataCommande } from "../hooks/add-commande";
import { useGetlistefournisseur } from "../hooks/get-liste-fournisseur";
import { useGetlistestock } from "../hooks/get-liste-stock";
import { SelectDemo } from "./select";

interface PropsEditCommande {
  initialData?: PropsDataCommande;
  mod: "edit" | "add";
  onsubmit: (data: PropsDataCommande) => Promise<void>;
}

export default function CardAjoutCommande({
  initialData,
  mod,
  onsubmit,
}: PropsEditCommande) {
  const Getfournisseur = useGetlistefournisseur();
  const stock = useGetlistestock();

  const [data, setData] = useState<PropsDataCommande>(
    initialData || {
      produit: "",
      produitID: "",
      fournisseur: "",
      fournisseurID: "",
      createdAt: new Date(),
      commantaire: "",
      quantite: "",
      status: false,
    }
  );

  useEffect(() => {
    if (initialData) {
      // 🧠 Vérifie si initialData.createdAt est un Timestamp Firestore
      let createdAt = initialData.createdAt;

      if (createdAt instanceof Date) {
        // c’est déjà une Date, rien à faire
      } else if ((createdAt as any)?.toDate) {
        // si c’est un Timestamp Firestore
        createdAt = (createdAt as any).toDate();
      } else if ((createdAt as any)?.seconds) {
        // timestamp brut { seconds: number }
        createdAt = new Date((createdAt as any).seconds * 1000);
      } else {
        createdAt = new Date(); // fallback
      }

      setData({
        ...initialData,
        createdAt: createdAt || null,
      });
    }
  }, [initialData]);

  function calendarDateToJSDate(date: CalendarDate | null): Date | null {
    if (!date) return null;
    return new Date(date.year, date.month - 1, date.day);
  }

  const validateForm = () => {
    if (!data.produit || !data.produitID) {
      toast.info("Veuillez sélectionner un produit");
      return false;
    }
    if (!data.fournisseur || !data.fournisseurID) {
      toast.info("Veuillez sélectionner un fournisseur");
      return false;
    }
    if (!data.createdAt) {
      toast.info("Veuillez sélectionner la date de commande");
      return false;
    }
    if (!data.quantite || Number(data.quantite) <= 0) {
      toast.warning("La quantité doit être supérieure à 0");
      return false;
    }
    if (isNaN(Number(data.quantite))) {
      toast.info("Quantité invalide");
      return false;
    }
    // if (!data.commantaire) {
    //   toast.info("Veuillez entrer un commentaire");
    //   return false;
    // }
    return true;
  };

  const add = async () => {
    if (!validateForm()) return;

    try {
      await onsubmit(data);
      toast.success("Commande ajoutée avec succès !");
      if (mod === "add") {
      }
      resetForm();
    } catch (error: any) {
      toast.error(
        `Erreur lors de l'ajout : ${error.message || "Une erreur est survenue"}`
      );
    }
  };

  const resetForm = () => {
    setData({
      produit: "",
      produitID: "",
      fournisseur: "",
      fournisseurID: "",
      createdAt: new Date(),
      commantaire: "",
      quantite: "",
      status: false,
    });
  };

  // 🧩 Sécurisation : convertit seulement si c’est une vraie date
  const calendarValue =
    data.createdAt instanceof Date
      ? new CalendarDate(
          data.createdAt.getFullYear(),
          data.createdAt.getMonth() + 1,
          data.createdAt.getDate()
        )
      : null;

  return (
    <Card className="p-4 w-lg">
      <h1 className="text-blue-500 text-lg font-semibold mb-4">
        {mod === "add" ? "AJOUTER UNE COMMANDE " : "MODIFIER COMMANDE"}
      </h1>

      <div className="grid gap-3 mb-4">
        <span>Produit</span>
        <SelectDemo
          value={data.produitID || ""}
          label="Produit"
          data={stock || []}
          labelKey={(item) => `Stock ${item.nom} — (${item.quantite} unités)`}
          valueKey="id"
          onChange={(name, value, items) =>
            setData((prev) => ({
              ...prev,
              produit: String(items?.nom || ""),
              produitID: String(items?.id || ""),
            }))
          }
          className="w-full"
          placeholder="Produit"
        />
      </div>

      <div className="grid gap-3 mb-4">
        <span>Fournisseur</span>
        <SelectDemo
          value={data.fournisseurID || ""}
          label="Fournisseur"
          data={Getfournisseur || []}
          labelKey="nom"
          valueKey="id"
          onChange={(name, value, items) =>
            setData((prev) => ({
              ...prev,
              fournisseur: String(items?.nom || ""),
              fournisseurID: String(items?.id || ""),
            }))
          }
          className="w-full"
          placeholder="Fournisseur"
        />
      </div>

      <div className="grid gap-3 mb-4">
        <span>Date de commande</span>
        <Calendrier
          onChange={(calendarDate) =>
            setData((prev) => ({
              ...prev,
              createdAt: calendarDateToJSDate(calendarDate) ?? new Date(),
            }))
          }
          value={calendarValue}
        />
      </div>

      <div className="grid gap-3 mb-4">
        <span>Quantité en (Tonnes)</span>
        <InputDemo
          value={data.quantite}
          onChange={(e) =>
            setData((prev) => ({ ...prev, quantite: e.target.value || "" }))
          }
          type="text"
          placeholder="Entrez la quantité"
        />
      </div>

      <div className="grid gap-3 mb-4">
        <span>Commentaire</span>
        <TextareaDemo
          value={data.commantaire || ""}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              commantaire: String(e.target.value),
            }))
          }
          placeholder="Commentaire..."
          className="h-20"
        />
      </div>

      <div className="flex items-center gap-3 justify-center mt-4">
        <Button
          onClick={add}
          className="bg-green-500 hover:bg-green-400 cursor-pointer active:scale-90"
        >
          <CheckCircle className="mr-2" /> Ajouter
        </Button>
        <Button
          onClick={resetForm}
          className="bg-gray-500 hover:bg-gray-400 cursor-pointer active:scale-90"
        >
          <CiRedo className="mr-2" /> Réinitialiser
        </Button>
      </div>
    </Card>
  );
}
