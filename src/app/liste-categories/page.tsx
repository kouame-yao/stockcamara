"use client";
import AlertModal from "@/components/modal-alerte";
import { Column, DataTable } from "@/components/tableau-reetulisable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Wrapper from "@/layouts/wrapper";
import Loading from "@/propre-elements/components/loading";
import { useDeletedcategorie } from "@/propre-elements/hooks/ajouter-categorie";
import { useHandleId } from "@/propre-elements/hooks/hook-edited/edite-and-deleted-id";
import {
  Categorie,
  useGetCatProduc,
  useListeCategorie,
} from "@/propre-elements/hooks/liste-categorie";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";

interface Product {
  id: string;
  nom?: string;
  [key: string]: unknown;
}

export default function ListCategorie() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [valueInput, setValueInput] = useState({
    text: "",
    date: "",
  });
  const route = useRouter();
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, (Product | Record<string, unknown>)[]>
  >({});

  const { HandleId } = useHandleId();
  const page = (id: string) => {
    route.push("/modifier-categorie");
    HandleId(id);
  };
  const categories = useListeCategorie();
  const GetProduitAssocier = useGetCatProduc();
  const deletedcategorie = useDeletedcategorie();

  const deleted = async (id: string) => {
    categories.filter((doc) => doc.id !== id);
    await deletedcategorie(id);
  };

  useEffect(() => {
    async function fetchProducts() {
      for (const cat of categories) {
        if (cat.products && cat.products.length > 0) {
          const products = await GetProduitAssocier(cat?.products);
          setCategoryProducts((prev) => ({
            ...prev,
            [cat.id]: products,
          }));
        }
      }
    }
    fetchProducts();
  }, [categories, GetProduitAssocier]);

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

  // Filtrage des catégories
  const filteredCategories = useMemo(() => {
    const recherche = valueInput.text.trim().toLowerCase();
    const dateSearch = valueInput.date.trim();

    if (!recherche && !dateSearch) {
      return categories;
    }

    return categories.filter((cat) => {
      // Filtre texte
      let matchTexte = true;
      if (recherche) {
        matchTexte =
          String(cat.nom).toLowerCase().includes(recherche) ||
          String(cat.description).toLowerCase().includes(recherche);
      }

      // Filtre date
      let matchDate = true;
      if (dateSearch && cat?.createdAt) {
        try {
          const dateObj = convertToDate(cat.createdAt);
          const dateFormatted = format(dateObj, "yyyy-MM-dd");
          matchDate = dateFormatted.includes(dateSearch);
        } catch (error) {
          console.error("Erreur format date:", error);
          matchDate = true;
        }
      }

      return matchTexte && matchDate;
    });
  }, [categories, valueInput]);

  // Fonction pour générer le PDF
  const genererPDFCategories = () => {
    try {
      const doc = new jsPDF();

      // En-tête
      doc.setFontSize(18);
      doc.setTextColor(40, 116, 240);
      doc.text("Liste des Catégories", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      // Données du tableau
      const tableData = filteredCategories.map((cat) => {
        const produits = categoryProducts[cat.id] || [];
        const produitsNoms = produits
          .map((p) => (p as Record<string, unknown>).nom || p.nom)
          .join(", ");

        return [
          String(cat.nom || "—"),
          String(cat.description || "—"),
          cat.status ? "Active" : "Inactive",
          produitsNoms || "Aucun",
          cat.createdAt
            ? format(convertToDate(cat.createdAt), "dd/MM/yyyy")
            : "—",
        ];
      });

      // Générer le tableau
      autoTable(doc, {
        startY: 35,
        head: [["Nom", "Description", "Statut", "Produits", "Date"]],
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
          1: { cellWidth: 50 },
          2: { cellWidth: 20 },
          3: { cellWidth: 50 },
          4: { cellWidth: 30 },
        },
      });

      // Statistiques
      const y =
        (doc as unknown as Record<string, { finalY: number }>).lastAutoTable
          ?.finalY || 35;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total de catégories: ${filteredCategories.length}`, 14, y + 10);

      const actives = filteredCategories.filter((c) => c.status).length;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Actives: ${actives} | Inactives: ${
          filteredCategories.length - actives
        }`,
        14,
        y + 18
      );

      doc.save(`categories_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  // Fonction pour exporter en Excel
  const exporterExcel = () => {
    try {
      const excelData = filteredCategories.map((cat) => {
        const produits = categoryProducts[cat.id] || [];
        const produitsNoms = produits
          .map((p) => (p as Record<string, unknown>).nom || p.nom)
          .join(", ");

        return {
          Nom: cat.nom || "—",
          Description: cat.description || "—",
          Statut: cat.status ? "Active" : "Inactive",
          "Produits associés": produitsNoms || "Aucun",
          Date: cat.createdAt
            ? format(convertToDate(cat.createdAt), "dd/MM/yyyy")
            : "—",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 40 },
        { wch: 15 },
        { wch: 40 },
        { wch: 15 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Catégories");

      XLSX.writeFile(
        workbook,
        `categories_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Erreur export Excel:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const columns: Column<Categorie>[] = [
    {
      id: "nom",
      label: "Nom",
      format: (value) => String(value),
      searchable: true,
    },
    {
      id: "description",
      label: "Description",
      format: (value) => String(value),
      searchable: true,
    },
    {
      id: "status",
      label: "Status",
      searchable: true,
      format: (value) =>
        value ? (
          <Badge className="bg-green-500">Active</Badge>
        ) : (
          <Badge className="bg-red-500">Inactive</Badge>
        ),
    },
    {
      id: "products",
      label: "Produits associés",
      searchable: false,
      renderCell: (item) => {
        const produits = categoryProducts[item.id];
        if (!produits || produits.length === 0) return "Aucun produit";

        return (
          <select className="border outline-none rounded-md p-1">
            <option value="">Produits associés ({produits.length})</option>
            {produits?.map((p, i) => (
              <option key={i}>
                {String((p as Record<string, unknown>).nom || "")}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      id: "createdAt",
      label: "Date",
      searchable: false,
      isDate: true,
      format: (value) => {
        if (!value) return "—";
        const date = convertToDate(value);
        return format(date, "dd/MM/yyyy");
      },
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
              title={`la catégorie ${item.nom}`}
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
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row w-full justify-between gap-6 mb-6">
            <div className="grid gap-4">
              <h1 className="text-blue-600 text-xl sm:text-2xl font-bold">
                LISTE CATÉGORIES
              </h1>
              <Button
                onClick={() => route.push("/ajouter-categorie")}
                className="bg-green-500 hover:bg-green-400 w-full sm:w-auto"
              >
                <PlusCircle className="mr-2" />
                AJOUTER CATÉGORIE
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => genererPDFCategories()}
                className="bg-transparent border border-green-300 hover:bg-green-50 text-green-600"
              >
                <FaFilePdf className="mr-2" />
                Générer PDF
              </Button>
              <Button
                onClick={() => exporterExcel()}
                className="bg-transparent border border-red-300 hover:bg-red-50 text-red-600"
              >
                <FaFileExcel className="mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Recherche (nom, description...)
              </label>
              <Input
                onChange={(e) =>
                  setValueInput((prev) => ({ ...prev, text: e.target.value }))
                }
                value={valueInput.text}
                placeholder="Rechercher une catégorie..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Filtrer par date
              </label>
              <Input
                type="date"
                onChange={(e) =>
                  setValueInput((prev) => ({ ...prev, date: e.target.value }))
                }
                value={valueInput.date}
                className="w-full"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <DataTable<Categorie>
              items={categories}
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
