"use client";
import AlertModal from "@/components/modal-alerte";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Column, DataTable } from "@/components/tableau-reetulisable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Wrapper from "@/layouts/wrapper";
import Loading from "@/propre-elements/components/loading";
import { useDeletedclient } from "@/propre-elements/hooks/add-client";
import {
  PropsDataClientID,
  useGetlisteclient,
} from "@/propre-elements/hooks/get-liste-client";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";

// Fonction utilitaire pour convertir les dates
const convertToDate = (dateValue: unknown): Date => {
  if (dateValue instanceof Timestamp) {
    return dateValue.toDate();
  }
  if (dateValue instanceof Date) {
    return dateValue;
  }
  return new Date(String(dateValue));
};

export default function ListeClient() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [valueInput, setValueInput] = useState({
    text: "",
    date: "",
  });

  const client = useGetlisteclient();
  const route = useRouter();
  const { HandleId } = useHandleId();

  const page = (id: string) => {
    route.push("/modifier-client");
    HandleId(id);
  };
  const deletedclient = useDeletedclient();
  const deleted = async (id: string) => {
    client.filter((doc) => doc.id !== id);
    await deletedclient(id);
  };

  const genererPDFClients = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 240);
      doc.text("Liste des Clients", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      const filteredClients = client.filter((c) => {
        const recherche = valueInput.text.trim().toLowerCase();
        const dateSearch = valueInput.date.trim();
        if (!recherche && !dateSearch) return true;

        let matchTexte = true;
        if (recherche) {
          matchTexte =
            String(c.nom).toLowerCase().includes(recherche) ||
            String(c.prenom).toLowerCase().includes(recherche) ||
            String(c.email).toLowerCase().includes(recherche) ||
            String(c.telephone).toLowerCase().includes(recherche) ||
            String(c.adresse).toLowerCase().includes(recherche);
        }

        let matchDate = true;
        if (dateSearch && c.createdAt) {
          try {
            const dateFormatted = format(
              convertToDate(c.createdAt),
              "yyyy-MM-dd"
            );
            matchDate = dateFormatted.includes(dateSearch);
          } catch {
            matchDate = false;
          }
        }

        return matchTexte && matchDate;
      });

      const tableData = filteredClients.map((c) => [
        String(c.nom || "—"),
        String(c.prenom || "—"),
        String(c.email || "—"),
        String(c.telephone || "—"),
        String(c.adresse || "—"),
        c.createdAt ? format(convertToDate(c.createdAt), "dd/MM/yyyy") : "—",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          ["Nom", "Prénom", "Email", "Téléphone", "Adresse", "Date d'ajout"],
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
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 40 },
          5: { cellWidth: 25 },
        },
      });

      const y =
        (doc as unknown as Record<string, { finalY: number }>).lastAutoTable
          ?.finalY || 35;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total de clients: ${filteredClients.length}`, 14, y + 10);

      doc.save(`clients_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const exporterExcelClients = () => {
    try {
      const filteredClients = client.filter((c) => {
        const recherche = valueInput.text.trim().toLowerCase();
        const dateSearch = valueInput.date.trim();
        if (!recherche && !dateSearch) return true;

        let matchTexte = true;
        if (recherche) {
          matchTexte =
            String(c.nom).toLowerCase().includes(recherche) ||
            String(c.prenom).toLowerCase().includes(recherche) ||
            String(c.email).toLowerCase().includes(recherche) ||
            String(c.telephone).toLowerCase().includes(recherche) ||
            String(c.adresse).toLowerCase().includes(recherche);
        }

        let matchDate = true;
        if (dateSearch && c.createdAt) {
          try {
            const dateFormatted = format(
              convertToDate(c.createdAt),
              "yyyy-MM-dd"
            );
            matchDate = dateFormatted.includes(dateSearch);
          } catch {
            matchDate = false;
          }
        }

        return matchTexte && matchDate;
      });

      const excelData = filteredClients.map((c) => ({
        Nom: c.nom || "—",
        Prénom: c.prenom || "—",
        Email: c.email || "—",
        Téléphone: c.telephone || "—",
        Adresse: c.adresse || "—",
        "Date d'ajout": c.createdAt
          ? format(convertToDate(c.createdAt), "dd/MM/yyyy")
          : "—",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 30 },
        { wch: 20 },
        { wch: 40 },
        { wch: 20 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
      XLSX.writeFile(
        workbook,
        `clients_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const columns: Column<PropsDataClientID>[] = [
    {
      id: "nom",
      label: "Nom",
      format: (value) => String(value),
      searchable: true,
    },
    {
      id: "prenom",
      label: "Prenom",
      searchable: true,
      format: (value) => String(value),
    },
    {
      id: "email",
      label: "Email",
      searchable: true,
      format: (value) => String(value),
    },
    {
      id: "telephone",
      label: "Telephone",
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
      id: "createdAt",
      label: "Date d'ajout",
      isDate: true,
      searchable: false,
      format: (value) => {
        if (!value) return "Non définie";
        const date = convertToDate(value);
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
          <div>
            <AlertModal onConfirm={() => deleted(item.id)} />
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
                  LISTE CLIENTS
                </span>
                <Button
                  onClick={() => route.push("/ajouter-client")}
                  className="bg-green-500 hover:bg-green-400"
                >
                  <PlusCircle />
                  AJOUTER CLIENTS
                </Button>
              </div>
              <div className="grid gap-6">
                <div className="flex gap-3">
                  <Button
                    onClick={() => genererPDFClients()}
                    className="bg-transparent border border-green-300 hover:bg-green-50 text-green-600"
                  >
                    <FaFilePdf className="mr-2" />
                    Générer PDF
                  </Button>
                  <Button
                    onClick={() => exporterExcelClients()}
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
              <DataTable<PropsDataClientID>
                items={client}
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
    </ProtectedRoute>
  );
}
