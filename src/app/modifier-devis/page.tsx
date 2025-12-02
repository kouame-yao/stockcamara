"use client";

import CardAjoutDevis from "@/propre-elements/components/card-ajout-devis";
import {
  PropsDataDevis,
  useEditeDevis,
} from "@/propre-elements/hooks/ajouter-devis";
import { useGetDevis } from "@/propre-elements/hooks/get-liste-devis";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Composant séparé pour le contenu qui utilise useSearchParams
function ModifierDevisContent() {
  const search = useSearchParams();
  const id = search.get("id");
  const devis = useGetDevis();
  const newObejedevis = devis?.find((doc) => doc.id === id);

  const editedDevis = useEditeDevis();

  const handEddite = async (data: PropsDataDevis): Promise<void> => {
    if (!id) return;
    await editedDevis({ ...data, id });
  };

  return (
    <div>
      <CardAjoutDevis
        initialData={newObejedevis ?? undefined}
        mod="eddit"
        onsubmit={handEddite}
      />
    </div>
  );
}

// Composant principal avec Suspense
export default function ModifierDevis() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ModifierDevisContent />
    </Suspense>
  );
}
