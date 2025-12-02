"use client";

import { Button } from "@/components/ui/button";
import Wrapper from "@/layouts/wrapper";
import { useDeletedDevis } from "@/propre-elements/hooks/ajouter-devis";
import { useGetDevis } from "@/propre-elements/hooks/get-liste-devis";
import { format } from "date-fns";
import { Calendar, Eye, FileText, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ListeDevis() {
  const route = useRouter();
  const devis = useGetDevis();
  const deletedDevis = useDeletedDevis();

  const supprimerDevis = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce devis ?")) {
      await deletedDevis(id);
    }
  };

  const voirDevis = (id: string) => {
    route.push(`/modifier-devis?id=${id}`);
  };

  return (
    <Wrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* En-tête */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
                Liste des Devis
              </h1>
            </div>
            <p className="text-center text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Consultez, modifiez ou supprimez vos devis enregistrés en toute
              simplicité
            </p>

            <div className="grid justify-center mt-4">
              <Button onClick={() => route.push("/ajouter-devis")}>
                AJOUTER UN DEVIS
              </Button>
            </div>
          </div>

          {/* Grille de cartes */}
          {devis.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {devis.map((d, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-blue-300 overflow-hidden"
                >
                  {/* Badge référence */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                    <h2 className="text-base sm:text-lg font-bold text-white truncate">
                      {d.reference || "Réf inconnue"}
                    </h2>
                  </div>

                  {/* Contenu */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>
                        {format(
                          d.createdAt instanceof Date
                            ? d.createdAt
                            : (d.createdAt as any)?.toDate?.() ?? new Date(),
                          "dd/MM/yyyy"
                        )}
                      </span>
                    </div>

                    {/* Client */}
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 mb-0.5">Client</p>
                        <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                          {d.client.nom || "Non renseigné"}
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 mb-0.5">Montant</p>
                        <p className="text-base sm:text-lg font-bold text-green-600 truncate">
                          {d.totalHT?.toLocaleString() || "0"} FCFA
                        </p>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      <Button
                        onClick={() => voirDevis(d.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        <span className="hidden xs:inline">Voir</span>
                      </Button>
                      <Button
                        onClick={() => supprimerDevis(d.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        <span className="hidden xs:inline">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* État vide */
            <div className="flex flex-col items-center justify-center py-16 sm:py-24">
              <div className="bg-slate-100 rounded-full p-6 sm:p-8 mb-6">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">
                Aucun devis trouvé
              </h3>
              <p className="text-sm sm:text-base text-slate-500 text-center max-w-md">
                Commencez par créer votre premier devis pour le voir apparaître
                ici
              </p>
            </div>
          )}
        </main>
      </div>
    </Wrapper>
  );
}
