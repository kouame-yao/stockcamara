"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import {
  format,
  getWeekOfMonth,
  isSameMonth,
  subDays,
  subMonths,
} from "date-fns";
import { useMemo } from "react";
import useGetListeVentes from "../hooks/get-liste-ventes";

export function SectionCards() {
  const ventes = useGetListeVentes();

  // 📅 Vente du jour
  const maintenant = new Date();
  const hier = subDays(maintenant, 1);

  const ventesJourActuel = ventes.filter(
    (v) =>
      format(v.createdAt.toDate(), "dd/MM/yyyy") ===
      format(maintenant, "dd/MM/yyyy")
  );
  const ventesJourPrecedent = ventes.filter(
    (v) =>
      format(v.createdAt.toDate(), "dd/MM/yyyy") === format(hier, "dd/MM/yyyy")
  );

  const totalJourActuel = ventesJourActuel.reduce(
    (sum, v) => sum + v.totalGlobale,
    0
  );
  const totalJourPrecedent = ventesJourPrecedent.reduce(
    (sum, v) => sum + v.totalGlobale,
    0
  );

  const variationJour =
    totalJourPrecedent > 0
      ? ((totalJourActuel - totalJourPrecedent) / totalJourPrecedent) * 100
      : 0;
  const tendanceJour =
    variationJour > 0 ? "hausse" : variationJour < 0 ? "baisse" : "stable";

  // 📆 Vente par semaine (comparaison avec la semaine précédente)
  const ventesParSemaineDuMois = useMemo(() => {
    const maintenant = new Date();
    const grouped: Record<number, number> = {};

    ventes.forEach((v) => {
      const date = v.createdAt.toDate ? v.createdAt.toDate() : v.createdAt;
      if (isSameMonth(date, maintenant)) {
        const semaine = getWeekOfMonth(date);
        grouped[semaine] = (grouped[semaine] || 0) + v.totalGlobale;
      }
    });

    return grouped;
  }, [ventes]);

  const comparaisonSemaineActuelle = useMemo(() => {
    const maintenant = new Date();
    const semaineActuelle = getWeekOfMonth(maintenant);

    const current = ventesParSemaineDuMois[semaineActuelle] || 0;
    const previous = ventesParSemaineDuMois[semaineActuelle - 1] || 0;

    let variation = 0;
    if (previous > 0) {
      variation = ((current - previous) / previous) * 100;
    }

    return {
      semaine: semaineActuelle,
      current,
      previous,
      variation,
      tendance: variation > 0 ? "hausse" : variation < 0 ? "baisse" : "stable",
    };
  }, [ventesParSemaineDuMois]);

  // 🗓️ Vente mensuelle
  const moisPrecedent = subMonths(maintenant, 1);

  const ventesMoisActuel = ventes.filter((v) =>
    isSameMonth(v.createdAt.toDate(), maintenant)
  );
  const ventesMoisPrecedent = ventes.filter((v) =>
    isSameMonth(v.createdAt.toDate(), moisPrecedent)
  );

  const totalMoisActuel = ventesMoisActuel.reduce(
    (sum, v) => sum + v.totalGlobale,
    0
  );
  const totalMoisPrecedent = ventesMoisPrecedent.reduce(
    (sum, v) => sum + v.totalGlobale,
    0
  );

  const variationMois =
    totalMoisPrecedent > 0
      ? ((totalMoisActuel - totalMoisPrecedent) / totalMoisPrecedent) * 100
      : 0;
  const tendanceMois =
    variationMois > 0 ? "hausse" : variationMois < 0 ? "baisse" : "stable";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* 📅 Vente du jour */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vente | Jour</CardDescription>
          <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalJourActuel.toLocaleString()} FCFA
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                tendanceJour === "hausse"
                  ? "text-green-600 border-green-600"
                  : tendanceJour === "baisse"
                  ? "text-red-600 border-red-600"
                  : "text-gray-500 border-gray-400"
              }
            >
              {tendanceJour === "hausse" ? (
                <IconTrendingUp />
              ) : tendanceJour === "baisse" ? (
                <IconTrendingDown />
              ) : (
                <span>•</span>
              )}
              {variationJour.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {tendanceJour === "hausse"
              ? "En hausse"
              : tendanceJour === "baisse"
              ? "En baisse"
              : "Stable"}{" "}
            de {Math.abs(Number(variationJour.toFixed(1)))}% par rapport à hier
          </div>
        </CardFooter>
      </Card>

      {/* 📆 Vente par semaine */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vente | Semaine</CardDescription>
          <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-3xl">
            {comparaisonSemaineActuelle.current.toLocaleString()} FCFA
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                comparaisonSemaineActuelle.tendance === "hausse"
                  ? "text-green-600 border-green-600"
                  : comparaisonSemaineActuelle.tendance === "baisse"
                  ? "text-red-600 border-red-600"
                  : "text-gray-500 border-gray-400"
              }
            >
              {comparaisonSemaineActuelle.tendance === "hausse" ? (
                <IconTrendingUp />
              ) : comparaisonSemaineActuelle.tendance === "baisse" ? (
                <IconTrendingDown />
              ) : (
                <span>•</span>
              )}
              {comparaisonSemaineActuelle.variation.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {comparaisonSemaineActuelle.tendance === "hausse"
              ? "Hausse hebdomadaire"
              : comparaisonSemaineActuelle.tendance === "baisse"
              ? "Baisse hebdomadaire"
              : "Stable cette semaine"}
          </div>
        </CardFooter>
      </Card>

      {/* 🗓️ Vente du mois */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vente | Mois</CardDescription>
          <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalMoisActuel.toLocaleString()} FCFA
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                tendanceMois === "hausse"
                  ? "text-green-600 border-green-600"
                  : tendanceMois === "baisse"
                  ? "text-red-600 border-red-600"
                  : "text-gray-500 border-gray-400"
              }
            >
              {tendanceMois === "hausse" ? (
                <IconTrendingUp />
              ) : tendanceMois === "baisse" ? (
                <IconTrendingDown />
              ) : (
                <span>•</span>
              )}
              {variationMois.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {tendanceMois === "hausse"
              ? "Progression mensuelle"
              : tendanceMois === "baisse"
              ? "Baisse ce mois-ci"
              : "Stable par rapport au mois dernier"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
