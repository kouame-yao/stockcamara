"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useGetListeVentes from "@/propre-elements/hooks/get-liste-ventes";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VenteItem {
  prix: number | string;
  produitID?: string;
  produitName: string;
  quantite: string | number;
  total: number;
  uniteName?: string;
}

interface Vente {
  clientID: string;
  createdAt: { seconds: number; nanoseconds: number };
  id: string;
  status: string;
  totalGlobale: number;
  ventes: VenteItem[];
}

interface ChartItem {
  mois: string;
  [produitName: string]: number | string;
}

export function ChartLineMultiple() {
  const ventes = useGetListeVentes();
  const currentYear = new Date().getFullYear();

  // Créer les 12 mois de l'année en cours
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(currentYear, i, 1).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    })
  );

  // Initialiser une map pour chaque mois
  const monthlyMap: Record<
    string,
    Record<string, { valeur: number; unite: string }>
  > = {};
  monthNames.forEach((m) => (monthlyMap[m] = {}));

  // Remplir les ventes
  ventes.forEach((vente) => {
    const date = new Date(vente.createdAt.seconds * 1000);
    const moisKey = date.toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
    if (!monthlyMap[moisKey]) monthlyMap[moisKey] = {};

    vente.ventes.forEach((item: any) => {
      const quantite = Number(item.quantite) || 0;
      const unite = item.produitName === "Sable" ? "chargements" : "tonnes";

      if (!monthlyMap[moisKey][item.produitName]) {
        monthlyMap[moisKey][item.produitName] = { valeur: 0, unite };
      }
      monthlyMap[moisKey][item.produitName].valeur += quantite;
    });
  });

  // Transformer en tableau pour Recharts
  const chartData: ChartItem[] = monthNames.map((mois) => {
    const products = monthlyMap[mois];
    const data: ChartItem = { mois };
    Object.entries(products).forEach(([produitName, { valeur }]) => {
      data[produitName] = valeur;
    });
    return data;
  });

  const allProducts = Array.from(
    new Set(
      chartData.flatMap((d) => Object.keys(d).filter((k) => k !== "mois"))
    )
  );

  const colors = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#a78bfa"];

  // Produit le plus vendu
  let topProductName = "";
  let topValeur = 0;
  allProducts.forEach((p) => {
    const total = chartData.reduce((sum, d) => sum + (Number(d[p]) || 0), 0);
    if (total > topValeur) {
      topValeur = total;
      topProductName = p;
    }
  });
  const topUnite = topProductName === "Sable" ? "chargements" : "tonnes";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes de Produits</CardTitle>
        <CardDescription>
          Graphique des ventes par produit et par mois ({currentYear})
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ left: 12, right: 12 }}
            barCategoryGap="20%" // réduit l'espacement des catégories
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="mois" />
            <YAxis />
            <Tooltip
              formatter={(value: any, name: any) => {
                const produit = name;
                const unite = produit === "Sable" ? "chargements" : "tonnes";
                return [`${value} ${unite}`, produit];
              }}
            />
            {allProducts.map((produit, index) => (
              <Bar
                key={produit}
                dataKey={produit}
                fill={colors[index % colors.length]}
                radius={2} // barres fines et arrondies
                barSize={20} // épaisseur fine
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter>
        <div className="flex gap-2 items-center text-sm">
          <div>
            Produit le plus vendu : {topProductName} ({topValeur} {topUnite})
          </div>
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
