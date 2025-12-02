"use client";
import { InputDemo } from "@/components/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftCircle, CheckCircle } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { CiRedo } from "react-icons/ci";
import { toast } from "react-toastify";
import { PropsDataStock } from "../hooks/ajouter-stock";
import { useListeProduit } from "../hooks/liste-produit";
import { SelectDemo } from "./select";

const Emplacementarray = [
  { name: "Entrepôt_1" },
  { name: "Entrepôt_2" },
  { name: "Magasin" },
  { name: "Réserve" },
  { name: "Autre" },
];

const StatusArray = [
  { name: "En stock" },
  { name: "Rupture" },
  { name: "En approvisionnement" },
  { name: "Réservé" },
];
interface PropsStok {
  mod: "eddit" | "add";
  initialData?: PropsDatastockID;
  onsubmit: (data: PropsDatastockID) => Promise<void>;
}
interface PropsDatastockID extends PropsDataStock {
  id: string;
}

export default function CardAjoutStock({
  mod,
  initialData,
  onsubmit,
}: PropsStok) {
  const [inputValue, setInputValue] = useState(0);
  const [data, setData] = useState<PropsDatastockID>({
    id: "",
    ProduitID: "",
    nom: "",
    quantite: 0,
    emplacement: "",
    status: "",
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const Produits = useListeProduit();

  const produitsDisponibles = useMemo(() => {
    // if (!Produits) return [];
    // return Produits.filter((produit) => produit.status === false);

    if (Produits && mod === "add") {
      return Produits.filter((produit) => produit.status === false);
    } else if (Produits && mod === "eddit") {
      return Produits.filter((produit) => produit.id === initialData?.id);
    }
  }, [Produits]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0;
    setInputValue(value);
    setData((prev) => ({ ...prev, quantite: value }));
  };

  // ✅ Fonction de validation avant ajout
  const validateForm = () => {
    if (!data.ProduitID) {
      toast.info("Veuillez sélectionner un produit.");
      return false;
    }

    if (!data.status) {
      toast.info("Veuillez sélectionner un statut.");
      return false;
    }
    if (!data.emplacement) {
      toast.info("Veuillez sélectionner un emplacement.");
      return false;
    }
    return true;
  };

  const add = async () => {
    if (!validateForm()) return;
    try {
      await onsubmit(data);
      if (mod === "add") {
        resetForm();
      }
    } catch (error: any) {}
  };

  const resetForm = () => {
    setData({
      id: "",
      ProduitID: "",
      nom: "",
      quantite: 0,
      emplacement: "",
      status: "",
    });
    setInputValue(0);
  };

  return (
    <Card className="p-4 w-lg">
      <div className="grid gap-3">
        <h1 className="text-blue-500 text-lg font-semibold">
          {mod === "add" ? "AJOUTER UN STOCK" : "MODIFIER  STOCK"}
        </h1>
      </div>

      {produitsDisponibles?.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4">
          <p className="text-sm">
            Aucun produit disponible (tous les produits ont un statut actif).
          </p>
        </div>
      )}

      <div className="grid gap-3 mt-4">
        <span className="font-medium">Sélectionner un produit</span>
        <SelectDemo
          data={produitsDisponibles ?? []}
          disabled={mod === "eddit"}
          value={data?.nom}
          labelKey={"nom"}
          valueKey="nom"
          className="w-full"
          label="Produit"
          placeholder="Sélectionner un produit"
          onChange={(name, value, items) =>
            setData((prev) => ({
              ...prev,
              id: String(items?.id || ""),
              ProduitID: String(items?.id || ""),
              nom: String(items?.nom || ""),
            }))
          }
        />
      </div>

      <div className="grid gap-3 mt-4">
        <span className="font-medium">Quantité en (Tonnes)</span>
        <InputDemo
          disabled={mod === "eddit" || "add"}
          onChange={handleChange}
          value={inputValue}
          type="number"
          placeholder="Entrez la quantité"
        />
      </div>

      <div className="grid gap-3 mt-4">
        <span className="font-medium">Status</span>
        <SelectDemo
          // disabled={}
          className="w-full"
          data={StatusArray}
          value={data.status}
          labelKey="name"
          valueKey="name"
          onChange={(name, value, items) =>
            setData((prev) => ({ ...prev, status: String(items?.name || "") }))
          }
          label="Status"
          placeholder="Sélectionner le statut"
        />
      </div>

      <div className="grid gap-3 mt-4">
        <span className="font-medium">Emplacement</span>
        <SelectDemo
          className="w-full"
          data={Emplacementarray}
          value={data.emplacement}
          labelKey="name"
          valueKey="name"
          onChange={(name, value, items) =>
            setData((prev) => ({
              ...prev,
              emplacement: String(items?.name || ""),
            }))
          }
          label="Emplacement"
          placeholder="Sélectionner l'emplacement"
        />
      </div>

      <div className="flex items-center gap-3 justify-center mt-6">
        <Button
          onClick={add}
          className="bg-green-500 hover:bg-green-400 cursor-pointer active:scale-90"
          disabled={produitsDisponibles?.length === 0}
        >
          <CheckCircle className="mr-2" /> Ajouter
        </Button>
        <Button className="bg-gray-500 hover:bg-gray-400 cursor-pointer active:scale-90">
          <ArrowLeftCircle className="mr-2" /> Retour
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
