"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Wrapper from "@/layouts/wrapper";
import CardAjourFournisseur from "@/propre-elements/components/card-ajout-fournisseur";
import { useAddfournisseur } from "@/propre-elements/hooks/add-fournisseur";

export default function AjouterFournisseur() {
  const fournisseur = useAddfournisseur();
  return (
    <ProtectedRoute>
      <Wrapper>
        <CardAjourFournisseur onsubmit={fournisseur} mod="add" />
      </Wrapper>
    </ProtectedRoute>
  );
}
