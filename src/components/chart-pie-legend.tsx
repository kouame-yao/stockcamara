"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useGetListeVentes from "@/propre-elements/hooks/get-liste-ventes";
import { format } from "date-fns";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export function ChartPieLegend() {
  const ventes = useGetListeVentes() || [];
  const ventesDuMois = ventes.filter((doc) => {
    const formatDate = format(doc.createdAt.toDate(), "MM/yyyy");
    const DateJ = format(new Date(), "MM/yyyy");

    return formatDate === DateJ || [];
  });

  // Regrouper les quantités par produit
  const dataMap: Record<string, number> = {};

  ventesDuMois?.forEach((commande) => {
    commande.ventes?.forEach((v: any) => {
      const produit = v.produitName || "Inconnu";
      const quantite = Number(v.quantite) || 0;
      dataMap[produit] = (dataMap[produit] || 0) + quantite;
    });
  });

  // Transformer pour le graphique
  const chartData = Object.keys(dataMap).map((produit) => ({
    name: produit,
    value: dataMap[produit],
  }));

  // Palette cohérente
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA66CC"];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Ventes par produit</CardTitle>
        <CardDescription>Période actuelle</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
