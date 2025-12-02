"use client";
import Wrapper from "@/layouts/wrapper";
import CardAjoutProduit from "@/propre-elements/components/card-ajout-produit";
import useAjouterProduit from "@/propre-elements/hooks/ajouter-produit";

export default function AjouterProduit() {
  const addProduct = useAjouterProduit();
  return (
    <Wrapper>
      <CardAjoutProduit mod="add" onsubmit={addProduct} />
    </Wrapper>
  );
}
