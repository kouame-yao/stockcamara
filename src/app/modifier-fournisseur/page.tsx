"use client";

import Wrapper from "@/layouts/wrapper";
import CardAjourFournisseur from "@/propre-elements/components/card-ajout-fournisseur";
import { useEditefournisseur } from "@/propre-elements/hooks/add-fournisseur";
import { useGetlistefournisseur } from "@/propre-elements/hooks/get-liste-fournisseur";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";

export default function ModifierFournisseur() {
  const editedFournisseur = useEditefournisseur();
  const Getfournisseur = useGetlistefournisseur();
  const { id } = useHandleId();
  const data = Getfournisseur.find((doc) => doc.id === id);
  return (
    <Wrapper>
      <CardAjourFournisseur
        onsubmit={editedFournisseur}
        initialData={data}
        mod="eddit"
      />
    </Wrapper>
  );
}
