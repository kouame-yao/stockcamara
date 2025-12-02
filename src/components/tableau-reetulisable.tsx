// components/DataTable.tsx
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isValid } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React, { ReactNode, useMemo, useState } from "react";

// 1. Interface Column exportée
export interface Column<T> {
  id: keyof T | string;
  label: string;
  format?: (value: unknown) => ReactNode;
  renderCell?: (item: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  searchable?: boolean;
  isDate?: boolean;
}

// 2. Props du composant
interface DataTableProps<T extends { id: string }> {
  items: T[];
  columns: Column<T>[];
  total?: string;
  showHeader?: boolean;
  textRecherche?: string;
  dateRecherche?: string;
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
}

// 3. Composant DataTable
export function DataTable<T extends { id: string }>({
  items,
  columns,
  total = "$0.00",
  showHeader = true,
  textRecherche,
  dateRecherche,
  itemsPerPage = 10,
  onItemsPerPageChange,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Fonction utilitaire pour convertir une valeur en date formatée
  const convertToDate = (value: unknown): string | null => {
    if (!value) return null;

    try {
      let date: Date;

      if (typeof value === "object" && "toDate" in value) {
        date = (value as any).toDate();
      } else if (value instanceof Date) {
        date = value;
      } else {
        date = new Date(value as string | number);
      }

      if (isValid(date)) {
        return format(date, "yyyy-MM-dd");
      }
    } catch (error) {
      console.error("Erreur conversion date:", error);
    }

    return null;
  };

  // Filtrage des ITEMS avec texte ET date
  const filteredItems = useMemo(() => {
    const recherche = textRecherche?.trim().toLowerCase();
    const dateSearch = dateRecherche?.trim();

    if (!recherche && !dateSearch) {
      return items;
    }

    return items.filter((item) => {
      let matchTexte = true;
      if (recherche) {
        matchTexte = columns.some((column) => {
          if (column.searchable === false || column.isDate) {
            return false;
          }

          if (column.renderCell) {
            return false;
          }

          let valeur: string;
          if (column.format) {
            const formatted = column.format(item[column.id as keyof T]);
            valeur = String(formatted || "").toLowerCase();
          } else {
            valeur = String(item[column.id as keyof T] || "").toLowerCase();
          }

          return valeur.includes(recherche);
        });
      }

      let matchDate = true;
      if (dateSearch) {
        matchDate = columns.some((column) => {
          if (!column.isDate) {
            return false;
          }

          const rawValue = item[column.id as keyof T];
          const dateFormatted = convertToDate(rawValue);

          if (!dateFormatted) {
            return false;
          }

          return dateFormatted.includes(dateSearch);
        });
      }

      return matchTexte && matchDate;
    });
  }, [items, columns, textRecherche, dateRecherche]);

  // Calculs de pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Réinitialiser la page si les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [textRecherche, dateRecherche, itemsPerPage]);

  // Fonctions de navigation
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Gestion du changement d'éléments par page
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newValue = Number(e.target.value);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newValue);
    }
    setCurrentPage(1); // Réinitialiser à la page 1
  };

  return (
    <div className="w-full">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.id)}
                  className={column.align === "right" ? "text-right" : ""}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell
                    key={`${item.id}-${String(column.id)}`}
                    className={`whitespace-normal break-words max-w-[400px] ${
                      column.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {column.renderCell
                      ? column.renderCell(item)
                      : column.format
                      ? column.format(item[column.id as keyof T])
                      : String(item[column.id as keyof T] || "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-8 text-gray-500"
              >
                Aucun résultat trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-gray-50">
          {/* Informations */}
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Affichage de <span className="font-semibold">{startIndex + 1}</span>{" "}
            à{" "}
            <span className="font-semibold">
              {Math.min(endIndex, filteredItems.length)}
            </span>{" "}
            sur <span className="font-semibold">{filteredItems.length}</span>{" "}
            résultats
          </div>

          {/* Contrôles de pagination */}
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
              title="Première page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
              title="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 px-2">
              <span className="text-sm text-gray-600">
                Page <span className="font-semibold">{currentPage}</span> sur{" "}
                <span className="font-semibold">{totalPages}</span>
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
              title="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
              title="Dernière page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Sélecteur d'éléments par page */}
          <div className="flex items-center gap-2 order-3">
            <label className="text-sm text-gray-600 hidden sm:inline">
              Lignes :
            </label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
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
  );
}
