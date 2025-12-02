"use client";
import Wrapper from "@/layouts/wrapper";
import CardAjoutCommande from "@/propre-elements/components/card-ajout-commande";
import useAddcommande from "@/propre-elements/hooks/add-commande";

export default function AjouterCommande() {
  const ajoutcommande = useAddcommande();
  return (
    <Wrapper>
      <CardAjoutCommande onsubmit={ajoutcommande} mod="add" />
    </Wrapper>
  );
}
