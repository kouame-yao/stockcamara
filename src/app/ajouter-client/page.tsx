"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Wrapper from "@/layouts/wrapper";
import CardAjoutClient from "@/propre-elements/components/card-ajout-client";
import useAddclient from "@/propre-elements/hooks/add-client";

export default function AjoutClient() {
  const addclient = useAddclient();
  return (
    <ProtectedRoute>
      <Wrapper>
        <CardAjoutClient mod="add" onsubmit={addclient} />
      </Wrapper>
    </ProtectedRoute>
  );
}
