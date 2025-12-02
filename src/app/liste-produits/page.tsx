"use client";
import AlertModal from "@/components/modal-alerte";
import { Column, DataTable } from "@/components/tableau-reetulisable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Wrapper from "@/layouts/wrapper";
import Loading from "@/propre-elements/components/loading";
import { useAuth } from "@/propre-elements/contexts/AuthContextProvider";
import { useDeletedproduit } from "@/propre-elements/hooks/ajouter-produit";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import {
  PropsObejtproduit,
  useListeProduit,
} from "@/propre-elements/hooks/liste-produit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function ListProduit() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [valueInput, setValueInput] = useState({
    text: "",
    date: "",
  });
  const route = useRouter();
  const Produits = useListeProduit();
  const loading = useAuth();
  const { HandleId } = useHandleId();

  const page = (id: string) => {
    route.push("/modifier-produit");
    HandleId(id);
  };
  const deletedProduit = useDeletedproduit();
  const deleted = async (id: string) => {
    Produits.filter((doc) => doc.id !== id);
    await deletedProduit(id);
  };

  const genererPDFProduits = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 240);
      doc.text("Liste des Produits", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      const filteredProduits = Produits.filter((prod) => {
        const recherche = valueInput.text.trim().toLowerCase();
        if (!recherche) return true;
        return (
          prod.nom?.toLowerCase().includes(recherche) ||
          prod.description?.toLowerCase().includes(recherche) ||
          prod.emplacement?.toLowerCase().includes(recherche)
        );
      });

      const tableData = filteredProduits.map((prod) => [
        prod.nom || "—",
        prod.prix || "—",
        prod.description || "—",
        prod.quantite || "Aucune stock disponible",
        prod.emplacement || "Non défini",
        prod.status ? "Disponible" : "Indisponible",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          ["Nom", "Prix", "Description", "Quantité", "Emplacement", "Statut"],
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
          0: { cellWidth: 30 },
          1: { cellWidth: 20 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20 },
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 35;
      doc.setFontSize(12);
      doc.setFont("undefined", "bold");
      doc.text(
        `Total de produits: ${filteredProduits.length}`,
        14,
        finalY + 10
      );
      const disponibles = filteredProduits.filter((p) => p.status).length;
      doc.setFontSize(10);
      doc.setFont("undefined", "normal");
      doc.text(
        `Disponibles: ${disponibles} | Indisponibles: ${
          filteredProduits.length - disponibles
        }`,
        14,
        finalY + 18
      );

      doc.save(`produits_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const exporterExcelProduits = () => {
    try {
      const filteredProduits = Produits.filter((prod) => {
        const recherche = valueInput.text.trim().toLowerCase();
        if (!recherche) return true;
        return (
          prod.nom?.toLowerCase().includes(recherche) ||
          prod.description?.toLowerCase().includes(recherche) ||
          prod.emplacement?.toLowerCase().includes(recherche)
        );
      });

      const excelData = filteredProduits.map((prod) => ({
        Nom: prod.nom || "—",
        Prix: prod.prix || "—",
        Description: prod.description || "—",
        "Quantité (Tonnes)": prod.quantite || "Aucune stock disponible",
        Emplacement: prod.emplacement || "Non défini",
        Statut: prod.status ? "Disponible" : "Indisponible",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 40 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");
      XLSX.writeFile(
        workbook,
        `produits_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const columns: Column<PropsObejtproduit>[] = [
    {
      id: "nom",
      label: "Nom",
      format: (value) => String(value),
      searchable: true,
    },
    {
      id: "prix",
      label: "Prix",
      format: (value) => String(value),
      searchable: true,
    },
    {
      id: "description",
      label: "Desciption",
      searchable: true,
      format: (value) => String(value),
    },
    {
      id: "quantite",
      label: "Quantité (Tonnes)",
      searchable: true,
      format: (value) =>
        value === undefined || value === null || value === ""
          ? "Aucune stock disponible"
          : String(value),
    },
    {
      id: "emplacement",
      label: "Emplacemant",
      searchable: true,
      format: (value) =>
        value === undefined || value === null || value === ""
          ? "Non défini"
          : String(value),
    },
    {
      id: "status",
      label: "status",
      searchable: false,
      isDate: false,
      format: (value) =>
        value === false ? (
          <Badge className="bg-red-500"> indisponible </Badge>
        ) : (
          <Badge className="bg-green-500"> disponible </Badge>
        ),
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
            <div className="grid gap-6">
              <span className="text-blue-500 text-lg font-bold">
                LISTES PRODUITS
              </span>
              <Button
                onClick={() => route.push("/ajouter-produit")}
                className="bg-green-500 hover:bg-green-400"
              >
                <PlusCircle />
                AJOUTER PRODUITS
              </Button>
            </div>
            <div className="grid gap-6">
              <div className="flex gap-3">
                <Button
                  onClick={() => genererPDFProduits()}
                  className="bg-transparent border border-green-300 hover:bg-green-50 text-green-600"
                >
                  <FaFilePdf className="mr-2" />
                  Générer PDF
                </Button>
                <Button
                  onClick={() => exporterExcelProduits()}
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
              placeholder="search..."
            />
          </div>
          <div className="border">
            <DataTable<PropsObejtproduit>
              items={Produits}
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
