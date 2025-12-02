"use client";
import AlertModal from "@/components/modal-alerte";
import { Button } from "@/components/ui/button";
import Loading from "@/propre-elements/components/loading";
import { useAuth } from "@/propre-elements/contexts/AuthContextProvider";
import { useDeleteVente } from "@/propre-elements/hooks/add-vente";
import useGetListeVentes from "@/propre-elements/hooks/get-liste-ventes";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaEdit, FaEye, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";

interface ProduitVendu {
  produitID: string;
  produitName: string;
  quantite: number;
  prix: number;
  total: number;
}

interface Client {
  id: string;
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

interface Vente {
  id: string;
  clientID: string;
  client: Client;
  ventes: ProduitVendu[];
  totalGlobale: number;
  status: string;
  type?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
    toDate?: () => Date;
  };
}

export default function CardListeProduitVendu() {
  const route = useRouter();

  const [input, setInput] = useState({
    champs: "",
    date: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loading = useAuth();
  const ventes = useGetListeVentes();
  const { HandleId } = useHandleId();

  const page = (id: string, type: string) => {
    route.push(`/modifier-produit-vendue?type=${type}`);
    HandleId(id);
  };

  const detailPaiement = (id: string) => {
    route.push(`/generer-pdf?id=${id}`);
  };

  const supprimerVente = useDeleteVente();

  const deleted = async (id: string) => {
    ventes.filter((doc) => doc.id !== id);
    await supprimerVente(id);
  };

  const formatDate = (createdAt: Vente["createdAt"]) => {
    if (!createdAt?.seconds) return "Non définie";
    try {
      const date = new Date(createdAt.seconds * 1000);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  // Filtrage des ventes
  const FilterVente = useMemo(() => {
    const Textrecerche = input.champs.trim().toLowerCase();
    const Daterecerche = input.date;

    return ventes.filter((doc) => {
      const matchText =
        !Textrecerche ||
        doc.client?.nom?.toLowerCase().includes(Textrecerche) ||
        doc.client?.prenom?.toLowerCase().includes(Textrecerche) ||
        doc.status?.toLowerCase()?.includes(Textrecerche);

      let matchDate = true;
      if (Daterecerche) {
        try {
          const dateForma = doc.createdAt.toDate
            ? format(doc.createdAt.toDate(), "yyyy-MM-dd")
            : format(new Date(doc.createdAt.seconds * 1000), "yyyy-MM-dd");
          matchDate = dateForma.includes(Daterecerche);
        } catch {
          matchDate = false;
        }
      }

      return matchText && matchDate;
    });
  }, [input, ventes]);

  // Pagination
  const totalPages = Math.ceil(FilterVente.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVentes = FilterVente.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres changent
  useMemo(() => {
    setCurrentPage(1);
  }, [input.champs, input.date, itemsPerPage]);

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  // ✅ Fonction pour générer le PDF
  const genererPDFVentes = () => {
    try {
      const doc = new jsPDF();

      // En-tête
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 240);
      doc.text("Liste des Ventes", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      // Données du tableau
      const tableData = FilterVente.map((vente) => [
        `${vente.client?.prenom || ""} ${vente.client?.nom || ""}`.trim(),
        `${Number(vente.totalGlobale).toLocaleString("fr-FR")} FCFA`,
        vente.status || "—",
        formatDate(vente.createdAt),
      ]);

      // Générer le tableau
      autoTable(doc, {
        startY: 35,
        head: [["Client", "Montant", "Statut", "Date"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [40, 116, 240],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Total
      const totalGeneral = FilterVente.reduce(
        (sum, vente) => sum + (vente.totalGlobale || 0),
        0
      );
      const finalY = (doc as any).lastAutoTable.finalY || 35;
      doc.setFontSize(12);
      doc.setFont("undefined", "bold");
      doc.text(
        `Total Général: ${totalGeneral.toLocaleString("fr-FR")} FCFA`,
        14,
        finalY + 10
      );
      doc.text(`Nombre de ventes: ${FilterVente.length}`, 14, finalY + 18);

      // Sauvegarder
      doc.save(`ventes_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  // ✅ Fonction pour exporter en Excel
  const exporterExcel = () => {
    try {
      const excelData = FilterVente.map((vente) => ({
        Client: `${vente.client?.prenom || ""} ${
          vente.client?.nom || ""
        }`.trim(),
        Montant: vente.totalGlobale,
        Statut: vente.status,
        Date: formatDate(vente.createdAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ventes");

      XLSX.writeFile(
        workbook,
        `ventes_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-blue-600">
              LISTES PRODUITS VENDUES
            </h1>
            <div className="flex gap-3">
              {/* ✅ Correction: onClick avec fonction fléchée */}
              <button
                onClick={() => genererPDFVentes()}
                className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-600 rounded hover:bg-green-50 transition"
              >
                <FaFilePdf /> Générer PDF
              </button>
              <button
                onClick={() => exporterExcel()}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-500 rounded hover:bg-red-50 transition"
              >
                <FaFileExcel /> Exporter Excel
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button onClick={() => route.push("/vendre-produits")}>
              VENDRE PRODUITS
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
              <input
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, champs: e.target.value }))
                }
                value={input.champs}
                type="text"
                placeholder="Rechercher client..."
                className="w-full sm:max-w-xs p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, date: e.target.value }))
                }
                value={input.date}
                type="date"
                className="w-full sm:max-w-xs p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVentes.length > 0 ? (
                  paginatedVentes.map((vente) => (
                    <tr key={vente.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {`${vente.client?.prenom || ""} ${
                          vente.client?.nom || ""
                        }`.trim() || "Client inconnu"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vente.totalGlobale
                          ? Number(vente.totalGlobale).toLocaleString("fr-FR") +
                            " FCFA"
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vente.status?.toLowerCase() === "payé"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {vente.status || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(vente.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => detailPaiement(vente.id)}
                            size="sm"
                            className="border border-green-600 bg-transparent hover:bg-green-50 text-green-600"
                          >
                            <FaEye className="mr-1" />
                            Détails
                          </Button>
                          <Button
                            onClick={() => page(vente.id, vente.type || "")}
                            size="sm"
                            className="border border-blue-600 bg-transparent hover:bg-blue-50 text-blue-600"
                          >
                            <FaEdit className="mr-1" />
                            Modifier
                          </Button>
                          <AlertModal
                            onConfirm={() => deleted(vente.id)}
                            title="cette vente"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      Aucune vente trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {FilterVente.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Affichage de{" "}
                  <span className="font-semibold">{startIndex + 1}</span> à{" "}
                  <span className="font-semibold">
                    {Math.min(endIndex, FilterVente.length)}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold">{FilterVente.length}</span>{" "}
                  ventes
                </div>

                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm text-gray-600">
                      Page <span className="font-semibold">{currentPage}</span>{" "}
                      sur <span className="font-semibold">{totalPages}</span>
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 order-3">
                  <label className="text-sm text-gray-600 hidden sm:inline">
                    Lignes :
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
