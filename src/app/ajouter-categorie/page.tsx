"use client";
import Wrapper from "@/layouts/wrapper";
import CardAjoutCategorie from "@/propre-elements/components/card-ajout-categorie";
import useAjoutcategie from "@/propre-elements/hooks/ajouter-categorie";

export default function AjouterCategorie() {
  const AddCategorie = useAjoutcategie();
  return (
    <Wrapper>
      <CardAjoutCategorie onSubmit={AddCategorie} />
    </Wrapper>
  );
}
