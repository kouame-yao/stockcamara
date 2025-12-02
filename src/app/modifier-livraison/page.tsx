"use client";
import Wrapper from "@/layouts/wrapper";
import CardAjoutLivraison from "@/propre-elements/components/card-ajout-livraison";
import {
  PropsDataLivraison,
  useEditedLivraison,
} from "@/propre-elements/hooks/add-livraison";
import { useGetlistelivraison } from "@/propre-elements/hooks/get-liste-livraison";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";

export default function ModifierLivraison() {
  const livraison = useGetlistelivraison();
  const { id } = useHandleId();
  const data = livraison.find((doc) => doc.id === id);
  const editedLivraison = useEditedLivraison();
  return (
    <Wrapper>
      <CardAjoutLivraison
        mod="edit"
        initialData={data}
        onsubmit={async (formData: PropsDataLivraison) => {
          if (!data?.id) return; // sécurité
          await editedLivraison({ ...formData, id: data.id });
        }}
      />
    </Wrapper>
  );
}
