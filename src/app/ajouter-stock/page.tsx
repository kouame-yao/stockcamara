"use client";
import Wrapper from "@/layouts/wrapper";
import CardAjoutStock from "@/propre-elements/components/card-ajout-stock";
import useAjouterStock from "@/propre-elements/hooks/ajouter-stock";

export default function AjouterStock() {
  const stock = useAjouterStock();
  return (
    <Wrapper>
      <div>
        <CardAjoutStock onsubmit={stock} mod="add" />
      </div>
    </Wrapper>
  );
}
