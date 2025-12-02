"use client";
import { InputDemo } from "@/components/input";
import { TextareaDemo } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CiRedo } from "react-icons/ci";
import { PropsDataProduit } from "../hooks/ajouter-produit";

import { toast } from "react-toastify";
import { useListeCategorie } from "../hooks/liste-categorie";
import { SelectDemo } from "./select";
const array = [{ name: "Inactive", value: false }];

interface Props {
  mod: "edit" | "add";
  initialData?: PropsDataProduit;
  onsubmit: (data: PropsDataProduit) => Promise<void>;
}
export default function CardAjoutProduit({
  initialData,
  mod,
  onsubmit,
}: Props) {
  const GetCategorie = useListeCategorie();
  const [valuechamp, setValueChamp] = useState<PropsDataProduit>(
    initialData || {
      nom: "",
      description: "",
      prix: "",
      categorie: "",
      status: false,
      quantite: 0,
      emplacement: "",
      createdAt: new Date(),
    }
  );
  useEffect(() => {
    if (initialData) {
      setValueChamp(initialData);
    }
  }, [initialData]);
  const handchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValueChamp((prev) => ({ ...prev, [name]: value }));
  };
  const resetForm = () => {
    setValueChamp({
      nom: "",
      description: "",
      prix: "",
      categorie: "",
      status: false,
      quantite: 0,
      emplacement: "",
      createdAt: new Date(),
    });
  };

  const verification = () => {
    if (!valuechamp.nom) {
      toast.info("Veillez remplir le champs nom");
      return false;
    }
    if (!valuechamp.prix) {
      toast.info("Veillez remplir le champs prix");
      return false;
    }
    if (isNaN(Number(valuechamp.prix))) {
      toast.info("Veillez entrez un prix correct");
      return false;
    }
    if (Number(valuechamp.prix) <= 0) {
      toast.info("Veillez entrez un prix suppérieur à 0");
      return false;
    }
    if (!valuechamp.categorie) {
      toast.info("Veillez remplir le champs categorie");
      return false;
    }
    return true;
  };

  function add() {
    if (!verification()) {
      return;
    }

    // if (Number(valuechamp.quantite) <= 0) {
    //   toast.warning("Quantité doit être suppérieur à 0");

    //   return;
    // }
    onsubmit(valuechamp);

    if (mod === "add") {
      resetForm();
    }
  }
  return (
    <Card className="p-4 w-lg">
      <div className="grid gap-3">
        <h1 className="text-blue-500">
          {mod === "add" ? "AJOUTER UN PRODUITS" : "MODIFIER PRODUIT"}
        </h1>
      </div>
      <div className="grid gap-3">
        <span>Nom</span>
        <InputDemo
          onChange={handchange}
          value={valuechamp.nom}
          name="nom"
          placeholder="..."
          type="text"
        />
      </div>
      <div className="grid gap-3">
        <span>Description</span>
        <TextareaDemo
          onChange={handchange}
          name="description"
          value={valuechamp.description}
          className="h-40"
          placeholder="Ajouter une description..."
        />
      </div>
      <div className="grid gap-3">
        <span>Prix Unitaire</span>
        <InputDemo
          onChange={handchange}
          name="prix"
          value={valuechamp.prix}
          placeholder="..."
        />
      </div>

      <div className="grid gap-3">
        <span>Catégorie</span>
        <SelectDemo
          disabled={mod === "edit"}
          onChange={(name, value, items) =>
            setValueChamp((prev) => ({ ...prev, categorie: items?.id || "" }))
          }
          name="categorie"
          className="w-full"
          data={GetCategorie}
          valueKey="id"
          labelKey={(items) => `${items.nom}`}
          label="Etat"
          placeholder="Séléction catégorie"
        />
      </div>

      <div className="grid gap-3">
        <span>Status</span>
        <SelectDemo
          disabled={true}
          name="status"
          data={array}
          labelKey="name"
          value="value"
          label="Etat"
          placeholder="Séléction l'état"
        />
      </div>
      <div className="flex items-center gap-3 place-items-center justify-center">
        <Button
          onClick={add}
          className="bg-green-500 hover:bg-green-400 cursor-pointer active:scale-90"
        >
          {" "}
          <CheckCircle /> Ajouter{" "}
        </Button>
        <Button className="bg-gray-500 hover:bg-gray-400 cursor-pointer active:scale-90">
          {" "}
          <ArrowLeftCircle /> Retour{" "}
        </Button>
        <Button className="bg-gray-500 hover:bg-gray-400 cursor-pointer active:scale-90">
          {" "}
          <CiRedo /> Rénicialiser{" "}
        </Button>
      </div>
    </Card>
  );
}
