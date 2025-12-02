"use client";
import Wrapper from "@/layouts/wrapper";
import CardCategorie from "@/propre-elements/components/card-ajout-categorie";
import {
  PropsDataCategorie,
  useEditecategorie,
} from "@/propre-elements/hooks/ajouter-categorie";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import { useListeCategorie } from "@/propre-elements/hooks/liste-categorie";

export default function ModifierCategorie() {
  const { id } = useHandleId();
  const categories = useListeCategorie();
  const editedCategorite = useEditecategorie();
  const data = categories.find((doc) => doc.id === id);

  console.log(data);

  return (
    <Wrapper>
      <CardCategorie
        mode="edit"
        initialData={
          data
            ? {
                ...data,
                createdAt: new Date(data.createdAt), // Conversion string → Date
              }
            : undefined
        }
        onSubmit={async (formData: PropsDataCategorie) => {
          if (!data?.id) return; // sécurité
          await editedCategorite({ ...formData, id: data.id });
        }}
      />
    </Wrapper>
  );
}
