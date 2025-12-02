"use client";
import { InputDemo } from "@/components/input";
import { TextareaDemo } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CiRedo } from "react-icons/ci";
import { toast } from "react-toastify";
import { PropsDatafournisseur } from "../hooks/add-fournisseur";
interface PropsDataIdFournisseur {
  mod: "eddit" | "add";
  initialData?: PropsDatafournisseur;
  onsubmit: (data: PropsDatafournisseur) => Promise<void>;
}
export default function CardAjourFournisseur({
  mod,
  initialData,
  onsubmit,
}: PropsDataIdFournisseur) {
  const [value, setValue] = useState<PropsDatafournisseur>(
    initialData || {
      nom: "",
      email: "",
      telephone: "",
      adresse: "",
      createdAt: new Date(),
    }
  );
  useEffect(() => {
    if (initialData) {
      setValue(initialData);
    }
  }, [initialData]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValue((prev) => ({ ...prev, [name]: value }));
  };

  const verification = () => {
    if (!value.nom) {
      toast.info("Veillez remplir le champs nom !");
      return false;
    }
    return true;
  };

  async function add() {
    if (!verification()) {
      return;
    }
    onsubmit(value);
    if (mod === "add") {
      setValue({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        createdAt: "",
      });
    }
  }
  return (
    <Card className="p-4 w-lg">
      <div className="grid gap-3">
        <h1 className="text-blue-500">
          {mod === "add" ? "AJOUTER UNE FOURNISSEUR" : "MODIFIER FOURNISSEUR"}
        </h1>
      </div>
      <div className="grid gap-3">
        <span>Nom</span>
        <InputDemo
          onChange={handleChange}
          value={value.nom}
          name="nom"
          placeholder="Entrez le Nom..."
        />
      </div>
      <div className="grid gap-3">
        <span>Email</span>
        <InputDemo
          value={value.email}
          name="email"
          onChange={handleChange}
          placeholder="Entrez l'email..."
          type="email"
        />
      </div>
      <div className="grid gap-3">
        <span>Telephone</span>
        <InputDemo
          onChange={handleChange}
          value={value.telephone}
          name="telephone"
          placeholder="Entrez le Tel..."
          type="number"
        />
      </div>
      <div className="grid gap-3">
        <span>Adresse</span>
        <TextareaDemo
          onChange={handleChange}
          value={value.adresse}
          name="adresse"
          className="h-20"
          placeholder="Ajouter une Adresse..."
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
          <CiRedo /> Rénicialiser{" "}
        </Button>
      </div>
    </Card>
  );
}
