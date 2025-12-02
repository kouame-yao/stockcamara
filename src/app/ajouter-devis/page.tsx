"use client";
import CardAjoutDevis from "@/propre-elements/components/card-ajout-devis";
import useAddDevis from "@/propre-elements/hooks/ajouter-devis";

export default function AjouterDevis() {
  const addDevis = useAddDevis();
  return (
    <div>
      <CardAjoutDevis onsubmit={addDevis} mod="add" />
    </div>
  );
}
