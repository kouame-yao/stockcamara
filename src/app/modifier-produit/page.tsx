"use client";

import Wrapper from "@/layouts/wrapper";
import CardAjoutProduit from "@/propre-elements/components/card-ajout-produit";
import {
  PropsDataProduit,
  useEditeproduit,
} from "@/propre-elements/hooks/ajouter-produit";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import { useListeProduit } from "@/propre-elements/hooks/liste-produit";

export default function ModifierCommande() {
  const { id } = useHandleId();
  const Produits = useListeProduit();
  const data = Produits.find((doc) => doc.id === id);

  const editedProduit = useEditeproduit();
  return (
    <Wrapper>
      <CardAjoutProduit
        mod="edit"
        initialData={
          data
            ? {
                ...data,
                status: Boolean(data.status),
                createdAt: data.createdAt ?? new Date(), // remplace undefined par Date
              }
            : undefined
        }
        onsubmit={async (formData: PropsDataProduit) => {
          if (!data?.id) return;
          await editedProduit({ ...formData, id: data.id });
        }}
      />
    </Wrapper>
  );
}
