"use client";

import AlertModal from "@/components/modal-alerte";
import { Column, DataTable } from "@/components/tableau-reetulisable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Wrapper from "@/layouts/wrapper";
import Loading from "@/propre-elements/components/loading";
import {
  PropsDataCommande,
  useDeletedcommande,
} from "@/propre-elements/hooks/add-commande";
import { useGetlistecommande } from "@/propre-elements/hooks/get-liste-commande";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf, FaTruck } from "react-icons/fa";
import { LiaStopwatchSolid } from "react-icons/lia";
import * as XLSX from "xlsx";

export default function ListCommande() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [valueInput, setValueInput] = useState({ text: "", date: "" });

  const route = useRouter();
  const { HandleId } = useHandleId();
  const page = (id: string) => {
    HandleId(id);
    route.push("/modifier-commande");
  };

  const deletedCommande = useDeletedcommande();
  const Getcommande = useGetlistecommande();

  interface CommandeAvecId extends PropsDataCommande {
    id: string;
  }

  const deleted = async (id: string) => {
    await deletedCommande(id);
  };

  // ✅ Utilitaire pour convertir safe Firestore Timestamp ou string/Date
  const formatDate = (date: Timestamp | string | Date | undefined): string => {
    if (!date) return "—";
    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      dateObj = new Date(); // fallback en cas de valeur inattendue
    }
    return format(dateObj, "dd/MM/yyyy");
  };

  const filteredCommandes = useMemo(() => {
    const recherche = valueInput.text.trim().toLowerCase();
    const dateSearch = valueInput.date.trim();

    if (!recherche && !dateSearch) return Getcommande;

    return Getcommande.filter((cmd) => {
      let matchTexte = true;
      if (recherche) {
        matchTexte =
          cmd.produit?.toLowerCase().includes(recherche) ||
          cmd.fournisseur?.toLowerCase().includes(recherche) ||
          cmd.commantaire?.toLowerCase().includes(recherche);
      }

      let matchDate = true;
      if (dateSearch && cmd.createdAt) {
        const dateStr =
          cmd.createdAt instanceof Timestamp
            ? format(cmd.createdAt.toDate(), "yyyy-MM-dd")
            : typeof (cmd.createdAt as any)?.toDate === "function"
            ? format((cmd.createdAt as any).toDate(), "yyyy-MM-dd")
            : format(new Date(cmd.createdAt), "yyyy-MM-dd");
        matchDate = dateStr.includes(dateSearch);
      }

      return matchTexte && matchDate;
    });
  }, [Getcommande, valueInput]);

  const genererPDFCommandes = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 240);
      doc.text("Liste des Commandes", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      const tableData = filteredCommandes.map((cmd) => [
        cmd.produit || "—",
        cmd.fournisseur || "—",
        formatDate(cmd.createdAt),
        cmd.quantite || "—",
        cmd.status ? "Livrée" : "En cours",
        cmd.commantaire || "—",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "Produit",
            "Fournisseur",
            "Date",
            "Quantité",
            "Statut",
            "Commentaire",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [40, 116, 240],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 35 },
        },
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 35;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total de commandes: ${filteredCommandes.length}`,
        14,
        finalY + 10
      );

      const livrees = filteredCommandes.filter((c) => c.status).length;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Livrées: ${livrees} | En cours: ${filteredCommandes.length - livrees}`,
        14,
        finalY + 18
      );

      doc.save(`commandes_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const exporterExcelCommandes = () => {
    try {
      const excelData = filteredCommandes.map((cmd) => ({
        Produit: cmd.produit || "—",
        Fournisseur: cmd.fournisseur || "—",
        Date: formatDate(cmd.createdAt),
        "Quantité (Tonnes)": cmd.quantite || "—",
        Statut: cmd.status ? "Livrée" : "En cours",
        Commentaire: cmd.commantaire || "—",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 25 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 35 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Commandes");
      XLSX.writeFile(
        workbook,
        `commandes_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const columns: Column<CommandeAvecId>[] = [
    {
      id: "produit",
      label: "Nom du Produit",
      searchable: false,
      format: (v) => String(v),
    },
    {
      id: "fournisseur",
      label: "Fournisseur",
      searchable: true,
      format: (v) => String(v),
    },
    {
      id: "createdAt",
      label: "Date de Commande",
      isDate: true,
      format: (value) => formatDate(value as any),
    },
    {
      id: "quantite",
      label: "Quantité (Tonnes)",
      searchable: true,
      format: (v) => String(v),
    },
    {
      id: "status",
      label: "Status",
      format: (value) =>
        value ? (
          <Badge className="bg-green-500 p-2">
            <FaTruck /> Livrée
          </Badge>
        ) : (
          <Badge className="bg-red-500 p-2">
            <LiaStopwatchSolid /> En cours
          </Badge>
        ),
    },
    {
      id: "commantaire",
      label: "Commentaire",
      searchable: false,
      format: (v) => String(v),
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
          <AlertModal
            onConfirm={() => deleted(item.id)}
            title="cette commande"
          />
        </div>
      ),
    },
  ];

  const loading = false; // à remplacer si tu as un état de chargement réel

  return (
    <Wrapper>
      {loading ? (
        <Loading />
      ) : (
        <Card className="p-4">
          <div className="flex w-full justify-between">
            <div className="grid gap-6">
              <span className="text-blue-500 text-lg font-bold">
                LISTES COMMANDES
              </span>
              <Button
                onClick={() => route.push("/ajouter-commande")}
                className="bg-green-500 hover:bg-green-400"
              >
                <PlusCircle /> AJOUTER COMMANDE
              </Button>
            </div>
            <div className="grid gap-6">
              <div className="flex gap-3">
                <Button
                  onClick={genererPDFCommandes}
                  className="bg-transparent border border-green-300 hover:bg-green-50 text-green-600"
                >
                  <FaFilePdf className="mr-2" /> Générer PDF
                </Button>
                <Button
                  onClick={exporterExcelCommandes}
                  className="bg-transparent border border-red-300 hover:bg-red-50 text-red-600"
                >
                  <FaFileExcel className="mr-2" /> Exporter Excel
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 place-items-end w-lg justify-end mt-4">
            <Input
              value={valueInput.text}
              placeholder="Rechercher..."
              onChange={(e) =>
                setValueInput((prev) => ({ ...prev, text: e.target.value }))
              }
            />
            <Input
              type="date"
              value={valueInput.date}
              placeholder="Filtrer par date..."
              onChange={(e) =>
                setValueInput((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>
          <div className="border mt-4">
            <DataTable<CommandeAvecId>
              items={Getcommande}
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
