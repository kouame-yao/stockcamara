"use client";

import { Button } from "@/components/ui/button";
import { useGetlistecommande } from "@/propre-elements/hooks/get-liste-commande";
import { useGetlistelivraison } from "@/propre-elements/hooks/get-liste-livraison";
import { differenceInDays, format } from "date-fns";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Composant séparé pour le contenu qui utilise useSearchParams
function DetailsLivraisonContent() {
  const route = useRouter();
  const searchParams = useSearchParams();

  const livraison = useGetlistelivraison();
  const commandes = useGetlistecommande();

  const idLv = searchParams.get("idLv");
  const Cd = searchParams.get("Cd");

  const LVS = livraison?.find((doc) => doc.id === idLv);
  const CMD = commandes?.find((doc) => doc.id === Cd);

  // 🔹 Fonction safe pour convertir Firestore Timestamp ou Date
  const toJSDate = (date?: Date | { toDate: () => Date } | null) => {
    if (!date) return null;
    return "toDate" in date ? date.toDate() : date;
  };

  const date2 = toJSDate(CMD?.createdAt);
  const date1 = toJSDate(LVS?.createdAt);

  if (!date1 || !date2) return <div>Patientez...</div>;

  const nbJours = differenceInDays(date1, date2);
  const DateCMD = format(date2, "dd/MM/yyyy");
  const DateLVS = format(date1, "dd/MM/yyyy");

  const tableHead = [
    { name: "Produit" },
    { name: "Fournisseur" },
    { name: "Quantité commandées" },
    { name: "Quantité reçu" },
    { name: "Prix unitaire" },
  ];

  const InfoSuppl = [
    { title: "Date de Livraison", description: DateLVS },
    { title: "Date de Commande", description: DateCMD },
    { title: "Différence de jours", description: `${nbJours + 1} Jours` },
    { title: "Status", description: CMD?.status ? "Livrée" : "En cours" },
  ];

  const imprimer = () => window.print();

  return (
    <main>
      <div className="flex flex-col space-y-6 justify-center h-screen px-6">
        {/* Info entreprise */}
        <div className="grid place-items-end mb-4">
          <Image
            width={100}
            height={100}
            src="/next.svg"
            alt="logo"
            className="grid place-items-end"
          />
          <h1 className="font-bold">Entreprise</h1>
          <div className="flex items-center gap-1 mt-2 mb-10">
            <section className="grid">
              <span className="font-bold">Adresse:</span>
              <span className="font-bold">Téléphone:</span>
              <span className="font-bold">Email:</span>
            </section>
            <section className="grid">
              <span className="text-gray-500">Lacota</span>
              <span className="text-gray-500">+225 000 000 000</span>
              <span className="text-gray-500">Email23@gmail.com</span>
            </section>
          </div>
        </div>

        {/* Tableau Livraison */}
        <div>
          <div className="text-lg font-bold mb-4">Détails de la livraison</div>
          <table className="table-auto border-separate border border-gray-300 w-full">
            <thead>
              <tr>
                {tableHead.map((doc, i) => (
                  <th className="border p-1 text-start bg-blue-200" key={i}>
                    {doc.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-1">{LVS?.produit}</td>
                <td className="border p-1">{LVS?.fournisseur}</td>
                <td className="border p-1">{CMD?.quantite}</td>
                <td className="border p-1">{LVS?.quantite}</td>
                <td className="border p-1">{LVS?.prixUnitaire}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tableau info supplémentaire */}
        <div>
          <h1 className="text-lg font-bold mb-4">Infos supplémentaires</h1>
          <table className="table-auto border-collapse border w-full">
            <tbody>
              {InfoSuppl.map((item, i) => (
                <tr key={i}>
                  <td className="p-1 font-semibold border">{item.title}</td>
                  <td className="p-1 font-medium border">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature */}
        <div className="flex justify-between items-center">
          <span>
            <u>Signature</u>
          </span>
          <span>
            <u>Caché de l'entreprise</u>
          </span>
        </div>

        {/* Boutons */}
        <div className="mb-4 flex justify-between items-center px-6">
          <Button className="bg-gray-400" onClick={() => route.back()}>
            Retour
          </Button>
          <Button onClick={imprimer}>Imprimer</Button>
        </div>
      </div>
    </main>
  );
}

// Composant principal qui wrappe le contenu dans Suspense
export default function DetailsLivraison() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <DetailsLivraisonContent />
    </Suspense>
  );
}
