"use client";
import Wrapper from "@/layouts/wrapper";
import CardAjoutCommande from "@/propre-elements/components/card-ajout-commande";
import {
  PropsDataCommande,
  useEditecommande,
} from "@/propre-elements/hooks/add-commande";
import { useGetlistecommande } from "@/propre-elements/hooks/get-liste-commande";

import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";

export default function ModifierCommande() {
  const Getcommande = useGetlistecommande();
  const { id } = useHandleId();
  const data = Getcommande.find((doc) => doc.id === id);
  const editedCommande = useEditecommande();
  return (
    <Wrapper>
      <CardAjoutCommande
        initialData={data}
        mod="edit"
        onsubmit={async (formData: PropsDataCommande) => {
          if (!data?.id) return; // sécurité
          await editedCommande({ ...formData, id: data.id });
        }}
      />
    </Wrapper>
  );
}
