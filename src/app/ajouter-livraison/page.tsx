"use client";
import Wrapper from "@/layouts/wrapper";
import CardAjoutLivraison from "@/propre-elements/components/card-ajout-livraison";
import useAjoutLivraison from "@/propre-elements/hooks/add-livraison";

export default function AjouterLivraison() {
  const addLivraison = useAjoutLivraison();
  return (
    <Wrapper>
      <CardAjoutLivraison mod="add" onsubmit={addLivraison} />
    </Wrapper>
  );
}
