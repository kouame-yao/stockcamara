"use client";
import { Button } from "@/components/ui/button";
import useGetListeVentes from "@/propre-elements/hooks/get-liste-ventes";
import { format } from "date-fns";
import { ArrowLeftCircle, Printer } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

// Composant séparé pour le contenu
function RecuPaiementContent() {
  const route = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id"); // ✅ Utilisez .get() au lieu de [1]
  const ventes = useGetListeVentes();
  const produit = ventes.find((doc) => doc.id === id);

  const prixChargeur = useMemo(() => {
    if (!Array.isArray(produit?.ventes) || produit?.ventes?.length === 0)
      return 0;

    return produit?.ventes?.reduce((acc: number, item: any) => {
      const valeur = Number(item.chargeur) || 0;
      return acc + valeur;
    }, 0);
  }, [produit]);

  const prixTransportAutre = useMemo(() => {
    if (!Array.isArray(produit?.ventes) || produit?.ventes?.length === 0)
      return 0;

    return produit?.ventes?.reduce((acc: number, item: any) => {
      const valeur = Number(item.carriere) || 0;
      return acc + valeur;
    }, 0);
  }, [produit]);

  const prixTransportGravier = useMemo(() => {
    if (!Array.isArray(produit?.ventes) || produit?.ventes?.length === 0)
      return 0;

    return produit?.ventes?.reduce((acc: number, item: any) => {
      const valeur = Number(item.transport) || 0;
      return acc + valeur;
    }, 0);
  }, [produit]);

  const FormaNumber = (number: number) => {
    return new Intl.NumberFormat("de-DE").format(number);
  };

  function generateReference() {
    const now = new Date();
    const yyyy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `VENTE-${yyyy}${mm}${dd}-${random}`;
  }

  const DateForma = format(new Date(), "dd/MM/yyyy");

  const Recu = () => (
    <div className="px-6">
      <main className="flex justify-between">
        <div>
          <h1>FACTURE</h1>
          <div className="flex items-center">
            <section className="grid">
              <span className="font-bold">Numero: </span>
              <span className="font-bold">Date:</span>
            </section>
            <section className="grid">
              <span className="text-gray-500">{generateReference()}</span>
              <span className="text-gray-500">{DateForma}</span>
            </section>
          </div>

          <div className="flex gap-1 items-center mt-5 mb-5">
            <section className="grid">
              <span className="font-bold">Nom:</span>
              <span className="font-bold">Prenom:</span>
              <span className="font-bold">Adress:</span>
              <span className="font-bold">Email:</span>
              <span className="font-bold">Téléphone:</span>
            </section>
            <section className="grid">
              <span className="text-gray-500">{produit?.client?.nom}</span>
              <span className="text-gray-500">{produit?.client?.prenom}</span>
              <span className="text-gray-500">{produit?.client?.adresse}</span>
              <span className="text-gray-500">{produit?.client?.email}</span>
              <span className="text-gray-500">
                {produit?.client?.telephone}
              </span>
            </section>
          </div>
        </div>

        <div>
          <div className="grid place-items-end mb-4">
            <Image
              width={100}
              height={100}
              src={"/logo.png"}
              alt="logo"
              className="grid place-items-end"
            />
          </div>
          <h1 className="font-bold">Entreprise</h1>
          <div className="flex items-center gap-1 mt-2 mb-10">
            <section className="grid">
              <span className="font-bold">Adresse:</span>
              <span className="font-bold">Téléphone:</span>
              <span className="font-bold">Email:</span>
            </section>
            <section className="grid">
              <span className="text-gray-500">Lacota</span>
              <span className="text-gray-500">+225 07 89 22 90 49</span>
              <span className="text-gray-500">camaramoussa@gmail.com</span>
            </section>
          </div>
        </div>
      </main>

      <h1 className="font-bold">Détails des produits</h1>
      <div>
        <table className="w-full border border-gray-300 mb-2">
          <thead className="bg-blue-100">
            <tr>
              <th className="border px-2 py-1 text-sm">Produit(s)</th>
              <th className="border px-2 py-1 text-sm">
                {produit?.type === "Autre" ? "Voyage(s)" : "Quantité (Tonnes)"}
              </th>
              <th className="border px-2 py-1 text-sm">Transport</th>
              <th className="border px-2 py-1 text-sm">PrixUnitaire (FRCFA)</th>
              <th className="border px-2 py-1 text-sm">Total (FRCFA)</th>
            </tr>
          </thead>
          <tbody>
            {produit?.ventes?.map((p: any, index: number) => (
              <tr key={index}>
                <td className="border px-2 py-1 text-sm">{p?.produitName}</td>
                <td className="border px-2 py-1 text-sm">
                  {p.quantite.toLocaleString()}
                </td>
                <td className="border px-2 py-1 text-sm">{p.uniteName}</td>
                <td className="border px-2 py-1 text-sm">
                  {FormaNumber(p.prix)}
                </td>
                <td className="border px-2 py-1 text-sm">
                  {FormaNumber(p.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid justify-end">
        <table className="w-full border border-blue-300 mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-sm">Prix chargement</th>
              <th className="border px-2 py-1 font-medium text-sm">
                {FormaNumber(prixChargeur)}FRCFA
              </th>
            </tr>
          </thead>
          <thead>
            <tr>
              <th className="border px-2 py-1 text-sm">Prix transport</th>
              <th className="border px-2 py-1 font-medium text-sm">
                {produit?.type === "Autre"
                  ? FormaNumber(prixTransportAutre)
                  : FormaNumber(prixTransportGravier)}{" "}
                FRCFA
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <u>Signature</u>

      <div className="grid justify-end">
        <table className="w-full border border-blue-300 mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-sm">Sous-total</th>
              <th className="border px-2 py-1 text-sm">
                {FormaNumber(produit?.totalGlobale)}FRCFA
              </th>
            </tr>
          </thead>
          <thead className="bg-green-300">
            <tr>
              <th className="border px-2 py-1 text-sm">Total à payer</th>
              <th className="border px-2 py-1 text-sm">
                {FormaNumber(produit?.totalGlobale)} FRCFA
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <p className="text-center text-xs italic">Merci pour votre confiance</p>
    </div>
  );

  const imprimer = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex flex-col justify-center h-screen">
        <Recu />
      </div>
      <div className="flex justify-between px-6 mb-7">
        <Button onClick={() => route.back()} className="bg-gray-500">
          <ArrowLeftCircle /> Retour
        </Button>
        <Button onClick={imprimer}>
          <Printer /> Imprimer
        </Button>
      </div>
    </div>
  );
}

// Composant principal avec Suspense
export default function RecuPaiement() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <RecuPaiementContent />
    </Suspense>
  );
}
