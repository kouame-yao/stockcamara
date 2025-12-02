"use client";

import Wrapper from "@/layouts/wrapper";
import CardAjoutClient from "@/propre-elements/components/card-ajout-client";
import {
  PropsDataClient,
  useEditeclient,
} from "@/propre-elements/hooks/add-client";
import { useGetlisteclient } from "@/propre-elements/hooks/get-liste-client";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";

export default function ModifierClient() {
  const client = useGetlisteclient();
  const { id } = useHandleId();
  const data = client.find((doc) => doc.id === id);

  console.log(data);

  const editedClient = useEditeclient();
  return (
    <Wrapper>
      <CardAjoutClient
        mod="edit"
        initialData={data}
        onsubmit={async (formData: PropsDataClient) => {
          if (!data?.id) return; // sécurité
          await editedClient({ ...formData, id: data.id });
        }}
      />
    </Wrapper>
  );
}
