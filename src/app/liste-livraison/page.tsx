"use client";
import AlertModal from "@/components/modal-alerte";
import { Column, DataTable } from "@/components/tableau-reetulisable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Wrapper from "@/layouts/wrapper";
import Loading from "@/propre-elements/components/loading";
import { useAuth } from "@/propre-elements/contexts/AuthContextProvider";
import { useDeletedlivraison } from "@/propre-elements/hooks/add-livraison";
import {
  PropsDataLivraisonId,
  useGetlistelivraison,
} from "@/propre-elements/hooks/get-liste-livraison";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function ListeLivraison() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [valueInput, setValueInput] = useState({
    text: "",
    date: "",
  });
  const loading = useAuth();
  const route = useRouter();
  const livraison = useGetlistelivraison();
  const { HandleId } = useHandleId();

  const page = (id: string) => {
    route.push("/modifier-livraison");
    HandleId(id);
  };

  const details = (idLv: string, idCd: string) => {
    route.push(`/details-livraison?idLv=${idLv}&Cd=${idCd}`);
  };

  const deletedLivraison = useDeletedlivraison();
  const deleted = async (id: string) => {
    livraison.filter((doc) => doc.id !== id);
    await deletedLivraison(id);
  };

  const genererPDFLivraisons = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 240);
      doc.text("Liste des Livraisons", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      const filteredLivraisons = livraison.filter((lv) => {
        const recherche = valueInput.text.trim().toLowerCase();
        const dateSearch = valueInput.date.trim();
        if (!recherche && !dateSearch) return true;

        let matchTexte = true;
        if (recherche) {
          matchTexte =
            lv.produit?.toLowerCase().includes(recherche) ||
            lv.fournisseur?.toLowerCase().includes(recherche) ||
            lv.quantite?.toString().toLowerCase().includes(recherche) ||
            lv.prixUnitaire?.toString().toLowerCase().includes(recherche);
        }

        let matchDate = true;

        if (dateSearch && lv.createdAt) {
          try {
            let date: Date;

            if (lv.createdAt instanceof Date) {
              // Si c’est déjà un Date
              date = lv.createdAt;
            } else if ((lv.createdAt as any)?.toDate) {
              // Si c’est un Timestamp Firestore
              date = (lv.createdAt as any).toDate();
            } else {
              // Dernier recours : timestamp brut
              date = new Date((lv.createdAt as any)?.seconds * 1000);
            }

            const dateFormatted = format(date, "yyyy-MM-dd");
            matchDate = dateFormatted.includes(dateSearch);
          } catch (error) {
            matchDate = false;
          }
        }

        return matchTexte && matchDate;
      });

      const tableData = filteredLivraisons.map((lv) => [
        lv.produit || "—",
        lv.fournisseur || "—",
        lv.quantite || "—",
        lv.prixUnitaire || "—",
        lv.createdAt
          ? format(
              lv.createdAt instanceof Date
                ? lv.createdAt
                : (lv.createdAt as any)?.toDate?.() ??
                    new Date((lv.createdAt as any)?.seconds * 1000),
              "dd/MM/yyyy"
            )
          : "Date inconnue",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "Produit",
            "Fournisseur",
            "Quantité (Tonnes)",
            "Prix Unitaire",
            "Date de livraison",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [40, 116, 240],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Produit
          1: { cellWidth: 30 }, // Fournisseur
          2: { cellWidth: 25 }, // Quantité
          3: { cellWidth: 25 }, // Prix Unitaire
          4: { cellWidth: 30 }, // Date
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 35;
      doc.setFontSize(12);
      doc.setFont("undefined", "bold");
      doc.text(
        `Total de livraisons: ${filteredLivraisons.length}`,
        14,
        finalY + 10
      );

      doc.save(`livraisons_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const exporterExcelLivraisons = () => {
    try {
      const filteredLivraisons = livraison.filter((lv) => {
        const recherche = valueInput.text.trim().toLowerCase();
        const dateSearch = valueInput.date.trim();
        if (!recherche && !dateSearch) return true;

        let matchTexte = true;
        if (recherche) {
          matchTexte =
            lv.produit?.toLowerCase().includes(recherche) ||
            lv.fournisseur?.toLowerCase().includes(recherche) ||
            lv.quantite?.toString().toLowerCase().includes(recherche) ||
            lv.prixUnitaire?.toString().toLowerCase().includes(recherche);
        }

        let matchDate = true;

        if (dateSearch && lv.createdAt) {
          try {
            let date: Date;

            if (lv.createdAt instanceof Date) {
              // Si c’est déjà un Date
              date = lv.createdAt;
            } else if ((lv.createdAt as any)?.toDate) {
              // Si c’est un Timestamp Firestore
              date = (lv.createdAt as any).toDate();
            } else {
              // Dernier recours : timestamp brut
              date = new Date((lv.createdAt as any)?.seconds * 1000);
            }

            const dateFormatted = format(date, "yyyy-MM-dd");
            matchDate = dateFormatted.includes(dateSearch);
          } catch (error) {
            matchDate = false;
          }
        }

        return matchTexte && matchDate;
      });

      const excelData = filteredLivraisons.map((lv) => ({
        Produit: lv.produit || "—",
        Fournisseur: lv.fournisseur || "—",
        "Quantité (Tonnes)": lv.quantite || "—",
        "Prix Unitaire": lv.prixUnitaire || "—",
        "Date de livraison": lv.createdAt
          ? format(
              lv.createdAt instanceof Date
                ? lv.createdAt
                : (lv.createdAt as any)?.toDate?.() ??
                    new Date((lv.createdAt as any)?.seconds * 1000),
              "dd/MM/yyyy"
            )
          : "Date inconnue",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 25 }, // Produit
        { wch: 25 }, // Fournisseur
        { wch: 20 }, // Quantité
        { wch: 20 }, // Prix Unitaire
        { wch: 25 }, // Date
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Livraisons");
      XLSX.writeFile(
        workbook,
        `livraisons_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const columns: Column<PropsDataLivraisonId>[] = [
    { id: "produit", label: "Nom", format: (value) => String(value) },
    {
      id: "fournisseur",
      label: "Fournisseur",
      searchable: true,
      format: (value) => String(value),
    },
    {
      id: "quantite",
      label: "Quantité (Tonnes)",
      searchable: true,
      format: (value) => String(value),
    },
    {
      id: "prixUnitaire",
      label: "Prix Unitaire",
      searchable: true,
      format: (value) => String(value),
    },
    {
      id: "createdAt",
      label: "Date de livraison",
      searchable: false,
      isDate: true,
      format: (value: any) => {
        if (!value) return "Non définie";
        const date = value.toDate
          ? value.toDate()
          : new Date(value.seconds * 1000);
        return format(date, "dd/MM/yyyy");
      },
    },
    {
      id: "actions",
      label: "Actions",
      searchable: false,
      isDate: false,
      renderCell: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => page(item.id)}>
            Modifier
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => details(item.id, item.CommandeID)}
          >
            Détails
          </Button>
          <div>
            <AlertModal
              onConfirm={() => deleted(item.id)}
              title="cette livraison"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <Wrapper>
      {loading ? (
        <Loading />
      ) : (
        <Card className="p-4">
          <div className="flex w-full justify-between">
            <div className="grid gap-6">
              <span className="text-blue-500 text-lg font-bold">
                LISTES LIVRAISONS
              </span>
              <Button
                onClick={() => route.push("/ajouter-livraison")}
                className="bg-green-500 hover:bg-green-400 w-70"
              >
                <PlusCircle />
                AJOUTER LIVRAISON
              </Button>
            </div>
            <div className="grid gap-6">
              <div className="flex gap-3">
                <Button
                  onClick={() => genererPDFLivraisons()}
                  className="bg-transparent border border-green-300 hover:bg-green-50 text-green-600"
                >
                  <FaFilePdf className="mr-2" />
                  Générer PDF
                </Button>
                <Button
                  onClick={() => exporterExcelLivraisons()}
                  className="bg-transparent border border-red-300 hover:bg-red-50 text-red-600"
                >
                  <FaFileExcel className="mr-2" />
                  Exporter Excel
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 place-items-end w-lg justify-end">
            <Input
              onChange={(e) =>
                setValueInput((prev) => ({ ...prev, text: e.target.value }))
              }
              value={valueInput.text}
              placeholder="Rechercher..."
            />
            <Input
              type="date"
              onChange={(e) =>
                setValueInput((prev) => ({ ...prev, date: e.target.value }))
              }
              value={valueInput.date}
              placeholder="Filtrer par date..."
            />
          </div>
          <div className="border">
            <DataTable<PropsDataLivraisonId>
              items={livraison}
              columns={columns}
              textRecherche={valueInput.text}
              dateRecherche={valueInput.date}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </Card>
      )}
    </Wrapper>
  );
}
