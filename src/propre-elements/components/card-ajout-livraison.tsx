"use client";

import Calendrier from "@/components/calendrier";
import { InputDemo } from "@/components/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarDate } from "@internationalized/date";
import { ArrowLeftCircle, CheckCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CiRedo } from "react-icons/ci";
import { toast } from "react-toastify";
import { PropsDataLivraison } from "../hooks/add-livraison";
import { useGetlistecommande } from "../hooks/get-liste-commande";
import { useGetlistestock } from "../hooks/get-liste-stock";
import { SelectDemo } from "./select";

const array = [
  { name: "Active", value: "active" },
  { name: "Inactive", value: "inactive" },
];

interface CardLivraisonProps {
  mod: "edit" | "add";
  onsubmit: (data: PropsDataLivraison) => Promise<void>;
  initialData?: PropsDataLivraison;
}

export default function CardAjoutLivraison({
  mod = "add",
  onsubmit,
  initialData,
}: CardLivraisonProps) {
  const Getcommande = useGetlistecommande();
  const stock = useGetlistestock();

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);
  const [data, setData] = useState<PropsDataLivraison>(
    initialData || {
      produitID: "",
      CommandeID: "",
      produit: "",
      fournisseur: "",
      quantite: "",
      prixUnitaire: "",
      emplacement: "",
      prixTransport: "",
      moyenTransport: "",
      total: 0,
      createdAt: null,
    }
  );

  // ✅ Filtrer les commandes avec status: false
  const commandesDisponibles = useMemo(() => {
    if (Getcommande && mod === "add") {
      return Getcommande.filter((commande) => commande.status === false);
    } else if (Getcommande && mod === "edit") {
      return Getcommande.filter(
        (commande) => commande.id === initialData?.CommandeID
      );
    } else {
      return [];
    }
  }, [Getcommande]);

  // 🔁 Conversion CalendarDate → JS Date
  function calendarDateToJSDate(date: CalendarDate | null): Date | null {
    if (!date) return null;
    return new Date(date.year, date.month - 1, date.day);
  }

  // 🔁 Conversion JS Date → CalendarDate
  function jsDateToCalendarDate(date: Date | null): CalendarDate | null {
    if (!date) return null;

    // Crée un CalendarDate à partir de la date JS
    const calendarDate = new CalendarDate(
      date.getFullYear(),
      date.getMonth() + 1, // JS months = 0-11
      date.getDate()
    );

    return calendarDate;
  }

  const handlechange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ CORRIGÉ : setData est maintenant DANS le useEffect
  useEffect(() => {
    if (data.produitID) {
      const idcommende = Getcommande?.find(
        (items) => items.produitID === data.produitID
      );
      const StockElement = stock?.find((items) => items.id === data.produitID);
      const result = Number(data.quantite) * Number(data.prixUnitaire);

      setData((prev) => ({
        ...prev,
        produit: String(StockElement?.nom || ""),
        fournisseur: String(idcommende?.fournisseur || ""),
        emplacement: String(StockElement?.emplacement || ""),
        total: result,
      }));
    }
  }, [data.produitID, data.quantite, data.prixUnitaire, Getcommande, stock]);
  const verification = () => {
    if (!data.produitID || !data.CommandeID) {
      toast.info("Veuillez sélectionner une commande");
      return false;
    }
    if (!data.prixUnitaire) {
      toast.info("saisir le prix");
      return false;
    }
    if (Number(data.prixUnitaire) <= 0) {
      toast.info("saisir un prix suppérieur à O");
      return false;
    }
    if (isNaN(Number(data.prixUnitaire))) {
      toast.info("saisir un prix correct !");
      return false;
    }

    if (!data.quantite) {
      toast.info("saisir la quantité");
      return false;
    }
    if (Number(data.quantite) <= 0) {
      toast.info("saisir une quantité suppérieur à O");
      return false;
    }
    if (isNaN(Number(data.quantite))) {
      toast.info("saisir une quantité correct !");
      return false;
    }
    if (!data.moyenTransport) {
      toast.info("saisir le moyen de transport");
      return false;
    }

    if (!data.prixTransport) {
      toast.info("saisir le prix du transport");
      return false;
    }

    if (!data.prixTransport) {
      toast.info("saisir le prix du transport");
      return false;
    }
    if (Number(data.prixTransport) <= 0) {
      toast.info("saisir un prix Transport suppérieur à O");
      return false;
    }
    if (isNaN(Number(data.prixTransport))) {
      toast.info("saisir un prix Transport correct !");
      return false;
    }
    if (!data.createdAt) {
      toast.info("saisir une date !");
      return false;
    }
    return true;
  };
  async function add() {
    // ✅ Vérification avant d'ajouter
    if (!verification()) {
      return;
    }

    await onsubmit({
      ...data,
      produitID: data.produitID,
      CommandeID: data.CommandeID,
    });

    if (mod === "add") {
      setData({
        produitID: "",
        CommandeID: "",
        produit: "",
        fournisseur: "",
        quantite: "",
        prixUnitaire: "",
        emplacement: "",
        prixTransport: "",
        moyenTransport: "",
        total: 0,
        createdAt: null,
      });
    }
  }

  // ✅ Fonction pour réinitialiser le formulaire
  function resetForm() {
    setData({
      produitID: "",
      CommandeID: "",
      produit: "",
      fournisseur: "",
      quantite: "",
      prixUnitaire: "",
      emplacement: "",
      prixTransport: "",
      moyenTransport: "",
      total: 0,
      createdAt: null,
    });
  }

  return (
    <Card className="p-4 w-lg">
      <div className="grid gap-3">
        <h1 className="text-blue-500 text-lg font-semibold">
          Ajouter une Livraison
        </h1>
      </div>

      {/* ✅ Afficher un message si aucune commande disponible */}
      {commandesDisponibles.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4">
          <p className="text-sm">
            Aucune commande en attente de livraison (toutes les commandes ont
            déjà été livrées).
          </p>
        </div>
      )}

      {/* --- Commande --- */}
      <div className="grid gap-3 mt-4">
        <label htmlFor="commande" className="font-medium">
          {mod === "add" ? "AJOUTER UNE LIVRAISON" : "MODIFIER LIVRAISON"}
        </label>
        <SelectDemo
          className="w-full"
          data={commandesDisponibles} // ✅ Utiliser le tableau filtré
          labelKey={(item) =>
            `Commande demandé ${item.produit} — (${item.quantite} unités) au fournisseur ${item.fournisseur}`
          }
          label="Commandes"
          name="produit"
          onChange={(name, value, items) =>
            setData((prev) => ({
              ...prev,
              produitID: String(items?.produitID || ""),
              CommandeID: String(items?.id || ""),
            }))
          }
          placeholder="Sélectionnez une commande"
        />
      </div>

      {/* --- Prix Unitaire --- */}
      <div className="grid gap-3 mt-4">
        <label htmlFor="prixUnitaire" className="font-medium">
          Prix Unitaire
        </label>
        <InputDemo
          value={data.prixUnitaire}
          placeholder="..."
          onChange={handlechange}
          name="prixUnitaire"
        />
      </div>

      {/* --- Quantité --- */}
      <div className="grid gap-3 mt-4">
        <label htmlFor="quantite" className="font-medium">
          Quantité réçu en (Tonnes)
        </label>
        <InputDemo
          value={data.quantite}
          placeholder="..."
          onChange={handlechange}
          name="quantite"
        />
      </div>

      {/* --- Moyen de transport --- */}
      <div className="grid gap-3 mt-4">
        <label htmlFor="moyenTransport" className="font-medium">
          Moyen de transport
        </label>
        <InputDemo
          value={data.moyenTransport}
          placeholder="..."
          type="text"
          onChange={handlechange}
          name="moyenTransport"
        />
      </div>

      {/* --- Prix transport --- */}
      <div className="grid gap-3 mt-4">
        <label htmlFor="prixTransport" className="font-medium">
          Prix du transport
        </label>
        <Input
          value={data.prixTransport}
          id="prixTransport"
          placeholder="..."
          onChange={handlechange}
          name="prixTransport"
        />
      </div>

      {/* --- Date de livraison --- */}
      <div className="grid gap-3 mt-4">
        <label htmlFor="dateLivraison" className="font-medium">
          Date de livraison
        </label>
        <Calendrier
          aria-label="Date de livraison"
          onChange={(calendarDate) =>
            setData(
              (prev) =>
                ({
                  ...prev,
                  createdAt: calendarDateToJSDate(calendarDate),
                } as PropsDataLivraison)
            )
          }
          value={jsDateToCalendarDate(data.createdAt)}
        />
      </div>

      {/* --- Boutons --- */}
      <div className="flex items-center gap-3 justify-center mt-6">
        <Button
          onClick={add}
          className="bg-green-500 hover:bg-green-400 cursor-pointer active:scale-90"
          disabled={commandesDisponibles.length === 0} // ✅ Désactiver si aucune commande
        >
          <CheckCircle className="mr-2" /> Ajouter
        </Button>
        <Button className="bg-gray-500 hover:bg-gray-400 cursor-pointer active:scale-90">
          <ArrowLeftCircle className="mr-2" /> Retour
        </Button>
        <Button
          className="bg-gray-500 hover:bg-gray-400 cursor-pointer active:scale-90"
          onClick={resetForm} // ✅ Utiliser la fonction resetForm
        >
          <CiRedo className="mr-2" /> Réinitialiser
        </Button>
      </div>
    </Card>
  );
}
