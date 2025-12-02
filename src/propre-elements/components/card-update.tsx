"use client";
import { Card } from "@/components/ui/card";
import { BoxIcon } from "lucide-react";
import useGetListeVentes from "../hooks/get-liste-ventes";

export default function CardUpdate() {
  const ventes = useGetListeVentes();

  // Date d'aujourd'hui sans heure
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ventesUpdate = ventes.filter((doc) => {
    if (!doc.updatedAt) return false;
    const updatedDate = doc.updatedAt.toDate();
    updatedDate.setHours(0, 0, 0, 0);
    return updatedDate.getTime() === today.getTime();
  });

  return (
    <Card className="p-4 shadow-lg bg-white rounded-xl">
      <h2 className="text-lg font-semibold mb-4">Mises à jour des ventes</h2>

      {ventesUpdate.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          Aucune mise à jour des ventes aujourd'hui
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ventesUpdate.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <BoxIcon size={40} className="text-blue-500" />
              </div>
              <div className="flex-1 grid gap-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold">
                    {item.ventes.map((doc: any, i: number) => (
                      <span key={i} className="text-gray-800">
                        {doc.produitName}
                        {i < item.ventes.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                  <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
                    {item.updatedAt.toDate().toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  La vente du client(e) <b>{item.client.nom}</b>{" "}
                  <b>{item.client.prenom}</b> a été mise à jour aujourd'hui
                  suite aux modifications apportées.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
