"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useGetListeVentes from "@/propre-elements/hooks/get-liste-ventes";
import { useMemo } from "react";
import { Badge } from "./ui/badge";
interface ProduitData {
  quantite: number;
  total: number;
}
export function TableDemo({ mod }: { mod: "preview" | "TopPreview" }) {
  const ventes = useGetListeVentes();

  const TopVentes = useMemo(() => {
    const totalParProduit: Record<string, ProduitData> = {};

    ventes.forEach((commande) => {
      commande.ventes?.forEach((item: any) => {
        const produit = item.produitName || item.carriere || "Inconnu";
        const quantite = Number(item.quantite) || 1;
        const total = Number(item.total) || 0; // total de la vente

        if (!totalParProduit[produit]) {
          totalParProduit[produit] = { quantite: 0, total: 0 };
        }

        totalParProduit[produit].quantite += quantite;
        totalParProduit[produit].total += total;
      });
    });

    const topProduits = Object.entries(totalParProduit)
      .map(([produit, valeurs]) => ({
        produit,
        quantite: valeurs.quantite,
        total: valeurs.total,
      }))
      .sort((a, b) => b.quantite - a.quantite); // tri par quantité décroissante

    return topProduits.slice(0, 5); // top 5 produits
  }, [ventes]);

  const Preview = () => (
    <Table>
      <TableCaption>La liste des ventes récentes</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead className="w-[100px]">Produit</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ventes.slice(0, 3).map((invoice, t) => (
          <TableRow key={t}>
            <TableCell className="font-medium">
              {invoice.client.prenom} {invoice.client.nom}
            </TableCell>
            {invoice.ventes.map((item: any, i: number) => (
              <TableCell className=" grid text-[10px]  " key={i}>
                {item.produitName}
              </TableCell>
            ))}
            <TableCell>{invoice.totalGlobale}</TableCell>
            <TableCell className="text-right">
              {" "}
              <Badge
                className={
                  invoice.status === "payé" ? "bg-green-500" : "bg-red-500"
                }
              >
                {invoice.status}
              </Badge>{" "}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          {/* <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell> */}
        </TableRow>
      </TableFooter>
    </Table>
  );

  const TopPreview = () => (
    <Table>
      <TableCaption>Top ventes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Produit</TableHead>
          <TableHead>Quantité</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {TopVentes.map((invoice, t) => (
          <TableRow key={t}>
            <TableCell className="">{invoice.produit}</TableCell>
            <TableCell className="">{invoice.quantite}</TableCell>
            <TableCell className="">{invoice.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          {/* <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell> */}
        </TableRow>
      </TableFooter>
    </Table>
  );
  return (
    <div>
      {mod === "preview" && <Preview />}
      {mod === "TopPreview" && <TopPreview />}
    </div>
  );
}
