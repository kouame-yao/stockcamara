"use client";

import { Card } from "@/components/ui/card";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { useGetlistecommande } from "@/propre-elements/hooks/get-liste-commande";
import { useGetlistelivraison } from "@/propre-elements/hooks/get-liste-livraison";

export default function TimeLine() {
  const Getcommande = useGetlistecommande();
  const livraison = useGetlistelivraison();

  // Normaliser les dates
  const normalizeItem = (item: any, type: "Commande" | "Livraison") => ({
    ...item,
    type,
    createdAt: item.createdAt?.seconds
      ? new Date(item.createdAt.seconds * 1000)
      : new Date(item.createdAt),
  });

  const livraisonsNorm = livraison
    .map((l) => normalizeItem(l, "Livraison"))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, 2);

  const commandesNorm = Getcommande.map((c) => normalizeItem(c, "Commande"))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, 2);

  const items = [...livraisonsNorm, ...commandesNorm].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <Card>
      <Timeline defaultValue={1}>
        {items.map((item, index) => (
          <TimelineItem
            key={item.id}
            step={index + 1}
            className="sm:group-data-[orientation=vertical]/timeline:ms-32"
          >
            <TimelineHeader>
              <TimelineSeparator />
              <TimelineDate className="sm:group-data-[orientation=vertical]/timeline:absolute sm:group-data-[orientation=vertical]/timeline:-left-32 sm:group-data-[orientation=vertical]/timeline:w-20 sm:group-data-[orientation=vertical]/timeline:text-right text-[10px]">
                {item.createdAt.toLocaleDateString("fr-FR")}
              </TimelineDate>
              <TimelineTitle className="sm:-mt-0.5">
                {item.type === "Livraison"
                  ? `Livraison: ${item.produit}`
                  : `Commande: ${item.produit}`}
              </TimelineTitle>
              <TimelineIndicator
                className={
                  item.type === "Commande" && !item.status
                    ? "bg-blue-500" // commande en trou → bleu
                    : "" // sinon couleur par défaut
                }
              />
            </TimelineHeader>
            <TimelineContent>
              {item.type === "Livraison" ? (
                <>
                  <div>Fournisseur: {item.fournisseur}</div>
                  <div>Emplacement: {item.emplacement}</div>
                  <div>Transport: {item.moyenTransport}</div>
                  <div>Quantité: {item.quantite}</div>
                  <div>Total: {item.total} FCFA</div>
                </>
              ) : (
                <>
                  <div>Fournisseur: {item.fournisseur}</div>
                  <div>Quantité: {item.quantite}</div>
                  <div>Status: {item.status ? "Non livrée" : "Livrée"}</div>
                  {item.commentaire && (
                    <div>Commentaire: {item.commentaire}</div>
                  )}
                </>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Card>
  );
}
