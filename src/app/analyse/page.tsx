"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Wrapper from "@/layouts/wrapper";
import { useGetlisteclient } from "@/propre-elements/hooks/get-liste-client";
import { useGetlistecommande } from "@/propre-elements/hooks/get-liste-commande";
import { useGetlistefournisseur } from "@/propre-elements/hooks/get-liste-fournisseur";
import { useGetlistelivraison } from "@/propre-elements/hooks/get-liste-livraison";
import useGetListeVentes from "@/propre-elements/hooks/get-liste-ventes";
import { useListeCategorie } from "@/propre-elements/hooks/liste-categorie";
import { useListeProduit } from "@/propre-elements/hooks/liste-produit";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangle, ShoppingCart, TrendingUp, Users } from "lucide-react";
import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- Types & Constants ---
type ActivityType = "Vente" | "Commande" | "Livraison";
type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color?: string;
};
type ProductVolume = { name: string; value: number };
type MonthlyMetric = {
  month: string;
  revenue: number;
  totalQty: number;
};
type SupplierDelivery = {
  fournisseur: string;
  quantite: number;
};
type RecentActivity = {
  type: ActivityType;
  date: Date;
  title: string;
  details: string;
};

const COLORS = [
  "#0ea5e9", // sky-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#f97316", // orange-500
  "#8b5cf6", // violet-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-600
];
const ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// --- Helper Components ---
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description,
  color = "bg-white",
}) => (
  <motion.div
    variants={ANIMATION_VARIANTS}
    initial="hidden"
    animate="visible"
    className={`${color} p-4 rounded-lg shadow flex items-center gap-3`}
  >
    {icon}
    <div>
      <div className="text-xs text-slate-500">{description}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  </motion.div>
);

// --- Main Component ---
export default function AnalyseGlobaleAdvanced() {
  // --- Data Fetching ---
  const ventes = useGetListeVentes() || [];
  const clients = useGetlisteclient() || [];
  const commandes = useGetlistecommande() || [];
  const fournisseurs = useGetlistefournisseur() || [];
  const livraisons = useGetlistelivraison() || [];
  const categories = useListeCategorie() || [];
  const produits = useListeProduit() || [];

  // --- Data Processing ---
  const toNumber = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const venteItemValue = (item: any): number => {
    if (!item) return 0;
    if (String(item.produitName) === "Sable") {
      return toNumber(item.voyage ?? item.quantite ?? 0);
    }
    return toNumber(item.quantite ?? item.voyage ?? 0);
  };

  // --- KPIs ---
  const totalVentesFCFA = useMemo(
    () => ventes.reduce((acc, v) => acc + toNumber(v.totalGlobale || 0), 0),
    [ventes]
  );
  const totalVentesQty = useMemo(
    () =>
      ventes.reduce((accV, v) => {
        if (!v.ventes) return accV;
        return (
          accV +
          v.ventes.reduce((s: number, it: any) => s + venteItemValue(it), 0)
        );
      }, 0),
    [ventes]
  );
  const totalCommandes = commandes.length;
  const totalClients = clients.length;
  const totalFournisseurs = fournisseurs.length;
  const totalProduits = produits.length;

  // --- Monthly Aggregation ---
  const monthLabels = useMemo(() => {
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(format(d, "yyyy-MM"));
    }
    return months;
  }, []);

  const monthlyMetrics = useMemo(() => {
    const map: Record<
      string,
      { revenue: number; volumes: Record<string, number> }
    > = {};
    monthLabels.forEach((m) => {
      map[m] = { revenue: 0, volumes: {} };
    });
    ventes.forEach((v) => {
      const created =
        v.createdAt?.toDate?.() ??
        (v.createdAt instanceof Date ? v.createdAt : null);
      if (!created) return;
      const monthKey = format(created, "yyyy-MM");
      if (!map[monthKey]) return;
      map[monthKey].revenue += toNumber(v.totalGlobale || 0);
      (v.ventes || []).forEach((it: any) => {
        const prod = String(it.produitName || "Inconnu");
        const val = venteItemValue(it);
        map[monthKey].volumes[prod] = (map[monthKey].volumes[prod] || 0) + val;
      });
    });
    const revenueSeries = monthLabels.map((m) => ({
      month: m,
      revenue: Math.round(map[m].revenue),
      totalQty: Object.values(map[m].volumes).reduce((a, b) => a + b, 0),
    }));
    const allProductsSet = new Set<string>();
    Object.values(map).forEach((m) =>
      Object.keys(m.volumes).forEach((p) => allProductsSet.add(p))
    );
    const allProducts = Array.from(allProductsSet).slice(0, 8);
    const stackedData = monthLabels.map((m) => {
      const row: Record<string, any> = { month: m };
      allProducts.forEach((p) => {
        row[p] = map[m].volumes[p] || 0;
      });
      return row;
    });
    return { revenueSeries, stackedData, allProducts };
  }, [ventes, monthLabels]);

  // --- Product Distribution ---
  const productDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    ventes.forEach((v) =>
      (v.ventes || []).forEach((it: any) => {
        const name = String(it.produitName || "Inconnu");
        map[name] = (map[name] || 0) + venteItemValue(it);
      })
    );
    return Object.keys(map)
      .map((k) => ({ name: k, value: map[k] }))
      .sort((a, b) => b.value - a.value);
  }, [ventes]);

  // --- Deliveries by Supplier ---
  const deliveriesBySupplier = useMemo(() => {
    const map: Record<string, number> = {};
    (livraisons || []).forEach((l: any) => {
      const supplier = String(l.fournisseur || "Inconnu");
      map[supplier] = (map[supplier] || 0) + toNumber(l.quantite || 0);
    });
    return Object.keys(map)
      .map((name) => ({ fournisseur: name, quantite: map[name] }))
      .sort((a, b) => b.quantite - a.quantite);
  }, [livraisons]);

  // --- Recent Activities ---
  const recentActivities = useMemo(() => {
    const rows: RecentActivity[] = [];
    (ventes || []).forEach((v) =>
      rows.push({
        type: "Vente",
        date: v.createdAt?.toDate?.() ?? new Date(),
        title: `${v.client?.prenom ?? ""} ${v.client?.nom ?? ""}`,
        details: `${(v.ventes || []).length} items — ${toNumber(
          v.totalGlobale
        )} FCFA`,
      })
    );
    (commandes || []).forEach((c: any) =>
      rows.push({
        type: "Commande",
        date: c.createdAt?.toDate?.() ?? new Date(),
        title: `${c.produit}`,
        details: `${c.quantite} — ${c.status ? "OK" : "En attente"}`,
      })
    );
    (livraisons || []).forEach((l: any) =>
      rows.push({
        type: "Livraison",
        date: l.createdAt?.toDate?.() ?? new Date(),
        title: `${l.produit}`,
        details: `${l.quantite} — ${l.fournisseur}`,
      })
    );
    return rows.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);
  }, [ventes, commandes, livraisons]);

  // --- Helpers ---
  const niceMonth = (ym: string): string => {
    try {
      const [y, m] = ym.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      return format(d, "MMM yy");
    } catch {
      return ym;
    }
  };

  // --- Loading State ---
  if (
    !ventes ||
    !clients ||
    !commandes ||
    !fournisseurs ||
    !livraisons ||
    !categories ||
    !produits
  ) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2 text-yellow-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Chargement des données...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <Wrapper>
      <div className="p-4 space-y-6">
        {/* Header & KPIs */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Analyse Globale — Tableau de bord
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Vue complète : ventes, volumes, livraisons, commandes et
              activités.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricCard
              title="CA total"
              value={`${totalVentesFCFA.toLocaleString()} FCFA`}
              icon={<TrendingUp className="h-6 w-6 text-green-500" />}
              description="Chiffre d'affaires"
            />
            <MetricCard
              title="Commandes"
              value={totalCommandes}
              icon={<ShoppingCart className="h-6 w-6 text-blue-500" />}
              description="Nombre total"
            />
            <MetricCard
              title="Clients"
              value={totalClients}
              icon={<Users className="h-6 w-6 text-yellow-500" />}
              description="Nombre total"
            />
          </div>
        </header>

        {/* Charts Row 1: Revenue & Product Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>CA mensuel (12 mois)</CardTitle>
              <CardDescription>
                Évolution du chiffre d'affaires et des volumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyMetrics.revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={niceMonth} />
                    <YAxis />
                    <ReTooltip
                      formatter={(v: any) => `${v.toLocaleString()} FCFA`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="CA (FCFA)"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot
                    />
                    <Line
                      type="monotone"
                      dataKey="totalQty"
                      name="Volume"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition produits</CardTitle>
              <CardDescription>
                Volumes vendus (part par produit)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div style={{ width: 280, height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={36}
                      label
                    >
                      {productDistribution.map((entry, idx) => (
                        <Cell
                          key={`c-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v: any) => `${v}`} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ right: -20 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top produits</CardTitle>
              <CardDescription>
                Les produits les plus vendus (volume)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productDistribution.slice(0, 6).map((p, idx) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          background: COLORS[idx % COLORS.length],
                        }}
                        className="rounded"
                      />
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-slate-500">
                          {p.value} unités
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {Math.round((p.value / (totalVentesQty || 1)) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2: Product Volumes & Supplier Deliveries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Volumes par produit — 12 mois</CardTitle>
              <CardDescription>
                Chaque mois: empilement par produit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyMetrics.stackedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={niceMonth} />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    {monthlyMetrics.allProducts.map(
                      (p: string, idx: number) => (
                        <Bar
                          key={p}
                          dataKey={p}
                          stackId="a"
                          fill={COLORS[idx % COLORS.length]}
                        />
                      )
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Livraisons par fournisseur</CardTitle>
              <CardDescription>
                Volume total livré par fournisseur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deliveriesBySupplier}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="fournisseur" type="category" width={120} />
                    <ReTooltip />
                    <Bar dataKey="quantite" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Activités récentes</CardTitle>
              <CardDescription>
                Derniers mouvements (ventes, commandes, livraisons)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((a, i) => (
                    <motion.div
                      key={i}
                      variants={ANIMATION_VARIANTS}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-between gap-3 p-3 bg-white rounded shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-400 rounded" />
                        <div>
                          <div className="text-sm font-semibold">
                            {a.title}{" "}
                            <span className="text-xs text-slate-400">
                              — {a.type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {format(a.date, "dd/MM/yyyy HH:mm")}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-700">{a.details}</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Aucune activité récente.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
              <CardDescription>Raccourci métriques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CA total</span>
                  <strong>{totalVentesFCFA.toLocaleString()} FCFA</strong>
                </div>
                <div className="flex justify-between">
                  <span>Volume total</span>
                  <strong>{totalVentesQty}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Produits</span>
                  <strong>{totalProduits}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Clients</span>
                  <strong>{totalClients}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Commandes</span>
                  <strong>{totalCommandes}</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Wrapper>
  );
}
