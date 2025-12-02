"use client";
import { InputDemo } from "@/components/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CiRedo } from "react-icons/ci";
import { toast } from "react-toastify";
import { PropsDataClient } from "../hooks/add-client";

interface PropsEditeClient {
  mod: "edit" | "add";
  initialData?: PropsDataClient;
  onsubmit: (data: PropsDataClient) => Promise<void>;
}

export default function CardAjoutClient({
  mod,
  initialData,
  onsubmit,
}: PropsEditeClient) {
  const [data, setData] = useState<PropsDataClient>(
    initialData || {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
      createdAt: new Date(),
    }
  );
  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };
  const verification = () => {
    if (!data.nom) {
      toast.info("veillez saisir le nom");
      return false;
    }
    if (!data.prenom) {
      toast.info("Veillez saisir le prenom");
      return false;
    }
    if (!data.telephone) {
      toast.info("Veillez saisir le numero de téléphone");
      return false;
    }

    return true;
  };

  async function add() {
    if (!verification()) {
      return;
    }
    onsubmit(data);
    if (mod === "add") {
      setData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        createdAt: "",
      });
    }
  }
  return (
    <Card className="p-4 w-lg">
      <div>{mod === "add" ? "AJOUTER UN CLIENT " : "MODIFIER CLIENT"}</div>
      <div className="grid gap-3">
        <span>Nom</span>
        <InputDemo
          value={data.nom}
          type="text"
          onChange={handleChange}
          name="nom"
          placeholder="Entrez le nom"
        />
      </div>
      <div className="grid gap-3">
        <span>Prenom</span>
        <InputDemo
          value={data.prenom}
          type="text"
          onChange={handleChange}
          name="prenom"
          placeholder="Entrez le prenom"
        />
      </div>

      <div className="grid gap-3">
        <span>Adresse Email</span>
        <InputDemo
          value={data.email}
          type="email"
          onChange={handleChange}
          name="email"
          placeholder="Entrez l'email"
        />
      </div>
      <div className="grid gap-3">
        <span>Téléphone</span>
        <InputDemo
          value={data.telephone}
          type="number"
          onChange={handleChange}
          name="telephone"
          placeholder="Entrez le numero de téléphone"
        />
      </div>
      <div className="grid gap-3">
        <span>Adresse</span>
        <InputDemo
          value={data.adresse}
          type="text"
          onChange={handleChange}
          name="adresse"
          placeholder="Adresse (Ville/Quatier)"
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
