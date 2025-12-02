"use client";
import AlertModal from "@/components/modal-alerte";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Column, DataTable } from "@/components/tableau-reetulisable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Wrapper from "@/layouts/wrapper";
import Loading from "@/propre-elements/components/loading";
import { useAuth } from "@/propre-elements/contexts/AuthContextProvider";
import {
  PropsDatafournisseur,
  useDeletedfournisseur,
} from "@/propre-elements/hooks/add-fournisseur";
import { useGetlistefournisseur } from "@/propre-elements/hooks/get-liste-fournisseur";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function ListFournisseur() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [valueInput, setValueInput] = useState({
    text: "",
  });
  const loading = useAuth();
  const Getfournisseur = useGetlistefournisseur();
  const route = useRouter();
  const { HandleId } = useHandleId();

  const page = (id: string) => {
    route.push("/modifier-fournisseur");
    HandleId(id);
  };

  interface fournisseurAvecId extends PropsDatafournisseur {
    id: string;
  }

  const deletedFournisseur = useDeletedfournisseur();
  const deleted = async (id: string) => {
    Getfournisseur.filter((doc) => doc.id !== id);
    await deletedFournisseur(id);
  };

  const genererPDFFournisseurs = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 240);
      doc.text("Liste des Fournisseurs", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      const filteredFournisseurs = Getfournisseur.filter((f) => {
        const recherche = valueInput.text.trim().toLowerCase();
        if (!recherche) return true;
        return (
          f.nom?.toLowerCase().includes(recherche) ||
          f.email?.toLowerCase().includes(recherche) ||
          String(f.telephone).toLowerCase().includes(recherche) ||
          f.adresse?.toLowerCase().includes(recherche)
        );
      });

      const tableData = filteredFournisseurs.map((f) => [
        f.nom || "—",
        f.email || "—",
        f.telephone || "—",
        f.adresse || "—",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Nom", "Email", "Téléphone", "Adresse"]],
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
          0: { cellWidth: 35 }, // Nom
          1: { cellWidth: 40 }, // Email
          2: { cellWidth: 30 }, // Téléphone
          3: { cellWidth: 40 }, // Adresse
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 35;
      doc.setFontSize(12);
      doc.setFont("undefined", "bold");
      doc.text(
        `Total de fournisseurs: ${filteredFournisseurs.length}`,
        14,
        finalY + 10
      );

      doc.save(`fournisseurs_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const exporterExcelFournisseurs = () => {
    try {
      const filteredFournisseurs = Getfournisseur.filter((f) => {
        const recherche = valueInput.text.trim().toLowerCase();
        if (!recherche) return true;
        return (
          f.nom?.toLowerCase().includes(recherche) ||
          f.email?.toLowerCase().includes(recherche) ||
          String(f.telephone).toLowerCase().includes(recherche) ||
          f.adresse?.toLowerCase().includes(recherche)
        );
      });

      const excelData = filteredFournisseurs.map((f) => ({
        Nom: f.nom || "—",
        Email: f.email || "—",
        Téléphone: f.telephone || "—",
        Adresse: f.adresse || "—",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 25 }, // Nom
        { wch: 30 }, // Email
        { wch: 20 }, // Téléphone
        { wch: 35 }, // Adresse
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Fournisseurs");
      XLSX.writeFile(
        workbook,
        `fournisseurs_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const columns: Column<fournisseurAvecId>[] = [
    {
      id: "nom",
      label: "Nom",
      format: (value) => String(value),
      searchable: true,
    },
    {
      id: "email",
      label: "Email",
      format: (value) => String(value),
      searchable: true,
    },
    {
      id: "telephone",
      label: "Téléphone",
      searchable: true,
      format: (value) => String(value),
    },
    {
      id: "adresse",
      label: "Adresse",
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
            <AlertModal
              onConfirm={() => deleted(item.id)}
              title="Ce fournisseur"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <Wrapper>
        {loading ? (
          <Loading />
        ) : (
          <Card className="p-4">
            <div className="flex w-full justify-between">
              <div className="grid gap-6">
                <span className="text-blue-500 text-lg font-bold">
                  LISTE FOURNISSEURS
                </span>
                <Button
                  onClick={() => route.push("/ajouter-fournisseur")}
                  className="bg-green-500 hover:bg-green-400"
                >
                  <PlusCircle />
                  AJOUTER FOURNISSEUR
                </Button>
              </div>
              <div className="grid gap-6">
                <div className="flex gap-3">
                  <Button
                    onClick={() => genererPDFFournisseurs()}
                    className="bg-transparent border border-green-300 hover:bg-green-50 text-green-600"
                  >
                    <FaFilePdf className="mr-2" />
                    Générer PDF
                  </Button>
                  <Button
                    onClick={() => exporterExcelFournisseurs()}
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
              <DataTable<fournisseurAvecId>
                items={Getfournisseur}
                columns={columns}
                textRecherche={valueInput.text}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </Card>
        )}
      </Wrapper>
    </ProtectedRoute>
  );
}
