"use client";
import Wrapper from "@/layouts/wrapper";
import CardAjoutAutreProduit from "@/propre-elements/components/card-ajout-autre-produit";
import CardVendProduit from "@/propre-elements/components/card-vend-produit";
import { RadioGroupDemo } from "@/propre-elements/components/radio-groupe";
import {
  PropsDataVentes,
  useAddVente,
  useVenteAutre,
} from "@/propre-elements/hooks/add-vente";
import { useState } from "react";

export default function VentProduit() {
  const ajoutvente = useAddVente();
  const option = [
    { id: "1", value: "gravier", label: "Gravier" },
    { id: "2", value: "sable", label: "Sable" },
  ];
  const [radio, setRadio] = useState("gravier");
  const AutreVente = useVenteAutre();

  return (
    <Wrapper>
      <section className="grid gap-7">
        <div className="grid gap-6">
          <label htmlFor="">Selectionnée le type de vente</label>
          <RadioGroupDemo
            options={option}
            defaultValue={radio}
            value={radio}
            onValueChange={setRadio}
          />
        </div>
        <div>
          {radio === "sable" ? (
            <CardAjoutAutreProduit onsubmit={AutreVente} mod="add" />
          ) : (
            <CardVendProduit
              onsubmit={async (formData: PropsDataVentes) => {
                await ajoutvente(formData); // on ignore le résultat
              }}
              mod="add"
            />
          )}
        </div>
      </section>
    </Wrapper>
  );
}
