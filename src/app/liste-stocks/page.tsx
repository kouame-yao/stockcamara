"use client";
import AlertModal from "@/components/modal-alerte";
import { Column, DataTable } from "@/components/tableau-reetulisable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Wrapper from "@/layouts/wrapper";
import Loading from "@/propre-elements/components/loading";
import { useAuth } from "@/propre-elements/contexts/AuthContextProvider";
import {
  PropsDataStock,
  useDeletedstock,
} from "@/propre-elements/hooks/ajouter-stock";
import { useGetlistestock } from "@/propre-elements/hooks/get-liste-stock";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function ListStock() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [valueInput, setValueInput] = useState({
    text: "",
    date: "",
  });
  const loading = useAuth();
  const route = useRouter();
  const { HandleId } = useHandleId();

  const page = (id: string) => {
    route.push("/modifier-stock");
    HandleId(id);
  };
  const stock = useGetlistestock();
  const deletedStock = useDeletedstock();
  const deleted = async (id: string) => {
    stock.filter((doc) => doc.id !== id);
    await deletedStock(id);
  };

  const genererPDFStocks = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 240);
      doc.text("Liste des Stocks", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      const filteredStocks = stock.filter((s) => {
        const recherche = valueInput.text.trim().toLowerCase();
        if (!recherche) return true;
        return (
          s.nom?.toLowerCase().includes(recherche) ||
          s.quantite?.toString().toLowerCase().includes(recherche) ||
          s.status?.toString().toLowerCase().includes(recherche) ||
          s.emplacement?.toLowerCase().includes(recherche)
        );
      });

      const tableData = filteredStocks.map((s) => [
        s.nom || "—",
        s.quantite || "—",
        s.status || "—",
        s.emplacement || "—",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Produit", "Quantité (Tonnes)", "Statut", "Emplacement"]],
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
          0: { cellWidth: 35 }, // Produit
          1: { cellWidth: 25 }, // Quantité
          2: { cellWidth: 20 }, // Statut
          3: { cellWidth: 35 }, // Emplacement
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 35;
      doc.setFontSize(12);
      doc.setFont("undefined", "bold");
      doc.text(`Total de stocks: ${filteredStocks.length}`, 14, finalY + 10);

      doc.save(`stocks_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const exporterExcelStocks = () => {
    try {
      const filteredStocks = stock.filter((s) => {
        const recherche = valueInput.text.trim().toLowerCase();
        if (!recherche) return true;
        return (
          s.nom?.toLowerCase().includes(recherche) ||
          s.quantite?.toString().toLowerCase().includes(recherche) ||
          s.status?.toString().toLowerCase().includes(recherche) ||
          s.emplacement?.toLowerCase().includes(recherche)
        );
      });

      const excelData = filteredStocks.map((s) => ({
        Produit: s.nom || "—",
        "Quantité (Tonnes)": s.quantite || "—",
        Statut: s.status || "—",
        Emplacement: s.emplacement || "—",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 30 }, // Produit
        { wch: 20 }, // Quantité
        { wch: 15 }, // Statut
        { wch: 30 }, // Emplacement
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stocks");
      XLSX.writeFile(
        workbook,
        `stocks_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const columns: Column<PropsDataStock>[] = [
    {
      id: "nom",
      label: "Produit",
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
      id: "status",
      label: "Status",
      format: (value) => String(value),
    },
    {
      id: "emplacement",
      label: "Emplacement",
      searchable: true,
      format: (value) => String(value),
    },
    {
      id: "actions",
      label: "Actions",
      searchable: false,
      renderCell: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => page(item.id)}>
            Modifier
          </Button>
          <div>
            <AlertModal onConfirm={() => deleted(item.id)} />
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
            <div className="grid gap-6 items-start">
              <span className="text-blue-500 text-lg font-bold">
                LISTES DES STOCKS
              </span>
              <Button
                onClick={() => route.push("/ajouter-stock")}
                className="bg-green-500 hover:bg-green-400"
              >
                <PlusCircle />
                AJOUTER STOCKS
              </Button>
            </div>
            <div className="grid gap-6">
              <div className="flex gap-3">
                <Button
                  onClick={() => genererPDFStocks()}
                  className="bg-transparent border border-green-300 hover:bg-green-50 text-green-600"
                >
                  <FaFilePdf className="mr-2" />
                  Générer PDF
                </Button>
                <Button
                  onClick={() => exporterExcelStocks()}
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
          </div>
          <div className="border">
            <DataTable<PropsDataStock>
              items={stock}
              columns={columns}
              textRecherche={valueInput.text}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </Card>
      )}
    </Wrapper>
  );
}
