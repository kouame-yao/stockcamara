"use client";

import { InputDemo } from "@/components/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Wrapper from "@/layouts/wrapper";
import {
  devisClient,
  devisProduct,
  PropsDataDevis,
} from "@/propre-elements/hooks/ajouter-devis";
import { format } from "date-fns";
import { ArrowLeftCircle, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
interface PropsDataInitial {
  mod: "eddit" | "add";
  initialData?: PropsDataDevis;
  onsubmit: (data: PropsDataDevis) => Promise<void>;
}
export default function CardAjoutDevis({
  mod,
  initialData,
  onsubmit,
}: PropsDataInitial) {
  const route = useRouter();
  const [produits, setProduits] = useState<devisProduct[]>([
    {
      designation: "",
      description: "",
      quantite: 1,
      prixUnitaire: 0,
      total: 0,
    },
  ]);

  const [imprimeValue, setImprimeValue] = useState(false);
  const [valuclient, setvalueclient] = useState<devisClient>({
    nom: "",
    telephone: "",
    adresse: "",
    email: "",
  });

  // INITIALISE INITIALDATA AVEC USEEFFECT

  useEffect(() => {
    if (initialData) {
      setProduits(initialData.devis);
      setvalueclient(initialData.client);
    }
  }, [initialData]);

  const handleChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newProduits = [...produits];

    // On met à jour la valeur
    newProduits[index] = { ...newProduits[index], [field]: value };

    // On calcule le total de la ligne à chaque modification de quantité ou prix
    const quantite = Number(newProduits[index].quantite);
    const prixUnitaire = Number(newProduits[index].prixUnitaire);
    newProduits[index].total = quantite * prixUnitaire;

    setProduits(newProduits);
  };
  const handleChangeClient = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setvalueclient((prev) => ({ ...prev, [name]: value }));
  };
  const verification = () => {
    if (!valuclient.nom) {
      toast.info("saisir le nom du client ");
      return false;
    }
    if (!valuclient.telephone) {
      toast.info("saisir le numero du client ");
      return false;
    }
    if (!valuclient.adresse) {
      toast.info("saisir le nom l'adresse du client ");
      return false;
    }
    for (const doc of produits) {
      if (!doc.designation) {
        toast.info("saisir le nom du produit ");
        return false;
      }
      if (!doc.quantite) {
        toast.info("saisir la quantité ");
        return false;
      }
      if (Number(doc.quantite) <= 0) {
        toast.info("saisir une quantité supperieur a 0 ");
        return false;
      }
      if (isNaN(Number(doc.quantite))) {
        toast.info("saisir une quantité correct ! ");
        return false;
      }
      if (!doc.prixUnitaire) {
        toast.info("saisir le prix ");
        return false;
      }
      if (Number(doc.prixUnitaire) <= 0) {
        toast.info("saisir un prix supperieur a 0 ");
        return false;
      }
      if (isNaN(Number(doc.prixUnitaire))) {
        toast.info("saisir un prix correct ! ");
        return false;
      }
    }
    return true;
  };
  const ajouterProduit = () => {
    if (!verification()) {
      return;
    }
    setProduits([
      ...produits,
      {
        designation: "",
        description: "",
        quantite: 1,
        prixUnitaire: 0,
        total: 0,
      },
    ]);
  };

  const supprimerProduit = (index: number) => {
    const newProduits = produits.filter((_, i) => i !== index);
    setProduits(newProduits);
  };

  const total = produits.reduce(
    (acc, p) => acc + Number(p.quantite) * Number(p.prixUnitaire),
    0
  );

  const imprimer = () => {
    if (!verification()) {
      return;
    }
    setImprimeValue(true);
    setTimeout(() => {
      window.print();
      setImprimeValue(false);
    }, 500);
  };
  const formate = format(new Date(), "dd/MM/yy");

  // GENERER REFERENCE
  function generateReference() {
    const now = new Date();
    const yyyy = now.getFullYear().toString().slice(-2); // 2 derniers chiffres de l'année
    const mm = String(now.getMonth() + 1).padStart(2, "0"); // mois
    const dd = String(now.getDate()).padStart(2, "0"); // jour
    const random = Math.floor(1000 + Math.random() * 9000); // nombre à 4 chiffres aléatoire
    return `DEV-${yyyy}${mm}${dd}-${random}`;
  }

  // Exemple
  const reference = generateReference(); // DEV-251103-4821
  function PageDevis() {
    const entreprise = {
      nom: "Camara Moussa Bâtiments",
      adresse: "Lacota",
      telephone: "+225 07 89 22 90 49",
      email: "camaramoussa@gmail.com",
      logo: "/logo.PNG", // 👉 mets ton logo ici
    };

    const client = {
      nom: `${valuclient.nom}`,
      adresse: `${valuclient.adresse}`,
      email: `${valuclient.email}`,
      telephone: `${valuclient.telephone} `,
    };

    const devis = {
      numero: `${reference}`,
      date: `${formate}`,
    };

    const totalHT = produits.reduce(
      (acc, item) => acc + item.quantite * item.prixUnitaire,
      0
    );
    // const tva = totalHT * 0.18;
    // const totalTTC = totalHT + tva;

    return (
      <div className="min-h-screen bg-white text-gray-800 p-10 print:p-0 font-sans">
        {/* --- En-tête --- */}
        <div className="flex justify-between items-start border-b pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">
              {entreprise.nom}
            </h1>
            <p className="text-sm">{entreprise.adresse}</p>
            <p className="text-sm">{entreprise.telephone}</p>
            <p className="text-sm">{entreprise.email}</p>
          </div>

          <div className="text-right">
            <Image
              src={entreprise.logo}
              alt="Logo entreprise"
              width={100}
              height={100}
              className="inline-block"
            />
          </div>
        </div>

        {/* --- Infos Devis --- */}
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Client</h2>
            <p>{client.nom}</p>
            <p>{client.adresse}</p>
            <p>{client.telephone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">Devis</h2>
            <p>
              Numéro : <strong>{devis.numero}</strong>
            </p>
            <p>Date : {devis.date}</p>
            {/* <p>Validité : {devis.validite}</p> */}
          </div>
        </div>

        {/* --- Tableau des produits --- */}
        <table className="w-full border-collapse border border-gray-300 mb-8">
          <thead className="bg-blue-50">
            <tr>
              <th className="border p-3 text-left">Désignation</th>
              <th className="border p-3 text-left">Description</th>
              <th className="border p-3 text-center">Quantité</th>
              <th className="border p-3 text-center">Prix Unitaire (FCFA)</th>
              <th className="border p-3 text-center">Total (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {produits?.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-3">{item.designation}</td>
                <td className="border p-3">{item.description}</td>
                <td className="border p-3 text-center">{item.quantite}</td>
                <td className="border p-3 text-center">
                  {item.prixUnitaire.toLocaleString()}
                </td>
                <td className="border p-3 text-center">
                  {(item.quantite * item.prixUnitaire).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- Totaux --- */}
        <div className="flex justify-end mb-12">
          <table className="text-right border-collapse w-1/3">
            <tbody>
              <tr>
                <td className="p-2 border">Total HT :</td>
                <td className="p-2 border">{totalHT.toLocaleString()} FCFA</td>
              </tr>
              <tr>
                <td className="p-2 border">TVA (%) :</td>
                <td className="p-2 border">{0} FCFA</td>
              </tr>
              <tr className="bg-blue-50 font-semibold">
                <td className="p-2 border">Total TTC :</td>
                <td className="p-2 border">{totalHT.toLocaleString()} FCFA</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* --- Pied de page --- */}
        <div className="flex justify-between items-end mt-12">
          <div>
            <p className="font-semibold mb-2">Signature du client :</p>
            <div className="h-16 border-b border-gray-400 w-48"></div>
          </div>

          <div className="text-right">
            <p className="font-semibold mb-2">Cachet et signature :</p>
            <div className="h-16 border-b border-gray-400 w-48"></div>
          </div>
        </div>

        <footer className="text-center text-gray-500 text-sm mt-10 border-t pt-4">
          <p>
            Merci pour votre confiance — {entreprise.nom}. Ce devis est valable{" "}
            à compter du {devis.date}.
          </p>
        </footer>
      </div>
    );
  }

  const renitialiser = () => {
    setImprimeValue(false);
    setProduits([]);
    setvalueclient({
      nom: "",
      telephone: "",
      email: "",
      adresse: "",
    });
  };
  const add = async () => {
    const data: PropsDataDevis = {
      client: valuclient,
      devis: produits,
      totalHT: total,
      reference: reference,
      createdAt: new Date(),
    };
    if (mod === "add") {
      if (!verification()) {
        return;
      }
    }
    await onsubmit(data);

    renitialiser();
  };

  return (
    <div>
      {imprimeValue ? (
        <PageDevis />
      ) : (
        <Wrapper>
          <main className="min-h-screen bg-gray-50 py-10 px-6">
            {mod === "eddit" && (
              <div className="p-2 w-full text-center border border-blue-500 rounded-md bg-blue-100 mb-4">
                Vous etès en mode modification : imprimer & modifier
              </div>
            )}
            <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-2xl shadow-lg">
              <h1 className="text-2xl font-bold text-center text-blue-700 mb-8">
                🧾 Création d’un Devis
              </h1>

              {/* Informations client */}
              <Card className="border-blue-200">
                <CardHeader>
                  <h2 className="font-semibold text-lg text-blue-600">
                    Informations Client
                  </h2>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <InputDemo
                    onChange={handleChangeClient}
                    name="nom"
                    value={valuclient.nom}
                    placeholder="Nom du client"
                  />
                  <InputDemo
                    onChange={handleChangeClient}
                    name="telephone"
                    value={valuclient.telephone}
                    placeholder="Téléphone"
                  />
                  <InputDemo
                    onChange={handleChangeClient}
                    name="email"
                    value={valuclient.email}
                    placeholder="Adresse email"
                  />
                  <InputDemo
                    onChange={handleChangeClient}
                    name="adresse"
                    value={valuclient.adresse}
                    placeholder="Adresse du client"
                  />
                </CardContent>
              </Card>

              {/* Produits */}
              <Card className="border-blue-200">
                <CardHeader className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg text-blue-600">
                    Produits / Services
                  </h2>
                  <Button
                    onClick={ajouterProduit}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle size={18} /> Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border p-2 text-left">Désignation</th>
                        <th className="border p-2 text-left">Description</th>
                        <th className="border p-2 text-center">Quantité</th>
                        <th className="border p-2 text-center">
                          Prix Unitaire (FCFA)
                        </th>
                        <th className="border p-2 text-center">Total (FCFA)</th>
                        <th className="border p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {produits.map((p, i) => (
                        <tr key={i} className="border-b">
                          <td className="border p-2">
                            <Input
                              placeholder="Nom du produit"
                              value={p.designation}
                              onChange={(e) =>
                                handleChange(i, "designation", e.target.value)
                              }
                            />
                          </td>
                          <td className="border p-2">
                            <Input
                              placeholder="Desciption"
                              value={p.description}
                              onChange={(e) =>
                                handleChange(i, "description", e.target.value)
                              }
                            />
                          </td>
                          <td className="border p-2 text-center">
                            <Input
                              value={p.quantite}
                              onChange={(e) =>
                                handleChange(i, "quantite", e.target.value)
                              }
                            />
                          </td>
                          <td className="border p-2 text-center">
                            <Input
                              value={p.prixUnitaire}
                              onChange={(e) =>
                                handleChange(i, "prixUnitaire", e.target.value)
                              }
                            />
                          </td>
                          <td className="border p-2 text-center">
                            {p.total.toLocaleString()}FCFA
                          </td>
                          <td className="border p-2 text-center">
                            <Button
                              disabled={produits.length === 1}
                              variant="destructive"
                              onClick={() => supprimerProduit(i)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Total */}
                  <div className="flex justify-end mt-4 font-semibold text-lg text-blue-700">
                    Total général : {total} FCFA
                  </div>
                </CardContent>
              </Card>

              {/* Boutons */}
              <div className="flex justify-between mt-6">
                <div className="flex items-center gap-4">
                  <Button
                    disabled={mod === "eddit"}
                    onClick={renitialiser}
                    variant="outline"
                    className="border-gray-400 text-gray-700 hover:bg-gray-200"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => route.back()}
                    variant="outline"
                    className="border-gray-400 bg-gray-500 hover:bg-gray-200"
                  >
                    <ArrowLeftCircle /> Retour
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={imprimer}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Imprimer
                  </Button>
                  <Button
                    onClick={add}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {mod === "add" ? "enregistrés" : "Modifier"}
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </Wrapper>
      )}
    </div>
  );
}
