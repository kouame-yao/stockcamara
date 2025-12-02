"use client";
import { InputDemo } from "@/components/input";
import { TextareaDemo } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CiRedo } from "react-icons/ci";
import { toast } from "react-toastify";
import { SelectDemo } from "./select";

interface PropsDataCategorie {
  nom: string;
  description: string;
  status: boolean;
  createdAt: Date | null;
}

interface CardCategorieProps {
  initialData?: PropsDataCategorie;
  onSubmit: (data: PropsDataCategorie) => Promise<void>;
  mode?: "add" | "edit";
}

const statusOptions = [{ name: "Inactive", value: false }];

export default function CardCategorie({
  initialData,
  onSubmit,
  mode = "add",
}: CardCategorieProps) {
  const [data, setData] = useState<PropsDataCategorie>(
    initialData || {
      nom: "",
      description: "",
      status: false,
      createdAt: new Date(),
    }
  );

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!data.nom || !data.description) {
      toast.info("Tous les champs sont obligatoires");
      return;
    }
    await onSubmit(data);
    if (mode === "add") {
      setData({
        nom: "",
        description: "",
        status: false,
        createdAt: new Date(),
      });
    }
  };

  const handleReset = () => {
    setData(
      initialData || {
        nom: "",
        description: "",
        status: false,
        createdAt: new Date(),
      }
    );
  };

  return (
    <Card className="p-4 w-lg">
      <div className="grid gap-3">
        <h1 className="text-blue-500">
          {mode === "add" ? "AJOUTER UNE CATEGORIE" : "MODIFIER LA CATEGORIE"}
        </h1>
      </div>
      <div className="grid gap-3">
        <span>Nom</span>
        <InputDemo
          type="text"
          onChange={handleChange}
          value={data.nom}
          placeholder="..."
          name="nom"
        />
      </div>
      <div className="grid gap-3">
        <span>Description</span>
        <TextareaDemo
          onChange={handleChange}
          value={data.description}
          className="h-40"
          placeholder="Ajouter une description..."
          name="description"
        />
      </div>
      <div className="grid gap-3">
        <span>Actif/Inactif</span>
        <SelectDemo
          data={statusOptions}
          labelKey="name"
          valueKey="name"
          onChange={(name, value, items) =>
            setData((prev) => ({ ...prev, status: items?.value || false }))
          }
          label="Etat"
          placeholder="Sélectionner l'état"
        />
      </div>
      <div className="flex items-center gap-3 place-items-center justify-center">
        <Button
          onClick={handleSubmit}
          className="bg-green-500 hover:bg-green-400 cursor-pointer active:scale-90"
        >
          <CheckCircle /> {mode === "add" ? "Ajouter" : "Modifier"}
        </Button>
        <Button
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-400 cursor-pointer active:scale-90"
        >
          <CiRedo /> Réinitialiser
        </Button>
      </div>
    </Card>
  );
}
