"use client";

import Wrapper from "@/layouts/wrapper";
import CardAjoutStock from "@/propre-elements/components/card-ajout-stock";
import { useEditestock } from "@/propre-elements/hooks/ajouter-stock";
import { useGetlistestock } from "@/propre-elements/hooks/get-liste-stock";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";

export default function ModifierStock() {
  const stock = useGetlistestock();
  const { id } = useHandleId();
  const data = stock.find((doc) => doc.id === id);
  const editedStock = useEditestock();
  return (
    <Wrapper>
      <div>
        <CardAjoutStock onsubmit={editedStock} mod="eddit" initialData={data} />
      </div>
    </Wrapper>
  );
}
