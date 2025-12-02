"use client";

import Wrapper from "@/layouts/wrapper";
import CardAjoutAutreProduit from "@/propre-elements/components/card-ajout-autre-produit";
import CardVendProduit from "@/propre-elements/components/card-vend-produit";
import {
  useEdditAutre,
  useModifierVente,
} from "@/propre-elements/hooks/add-vente";
import useGetListeVentes from "@/propre-elements/hooks/get-liste-ventes";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Composant séparé pour le contenu
function ModifierProduitVendueContent() {
  const ventes = useGetListeVentes();
  const { id } = useHandleId();
  const data = ventes?.find((doc) => doc.id === id);

  const modifierVente = useModifierVente();
  const AutreEddit = useEdditAutre();
  const searchParams = useSearchParams();
  const typeVente = searchParams.get("type");

  return (
    <Wrapper>
      {typeVente === "Autre" ? (
        <CardAjoutAutreProduit
          initialData={data ?? undefined}
          mod="eddit"
          onsubmit={async (nouvelleDonnes) => {
            if (id) {
              await AutreEddit(id, {
                ...nouvelleDonnes,
                updatedAt: nouvelleDonnes.updatedAt ?? null,
              });
            }
          }}
        />
      ) : (
        <CardVendProduit
          initialData={data ?? undefined}
          mod="eddit"
          onsubmit={async (nouvellesDonnees) => {
            if (id) {
              await modifierVente(id, nouvellesDonnees);
            }
          }}
        />
      )}
    </Wrapper>
  );
}

// Composant principal avec Suspense
export default function ModifierProduitVendue() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ModifierProduitVendueContent />
    </Suspense>
  );
}
