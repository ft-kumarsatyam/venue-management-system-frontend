import { ReactNode, useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  render?: (item: T) => ReactNode;
}

export interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface DataTableProps<T> {
  title?: string;
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowSelect?: (selectedIds: string[]) => void;
  actions?: (item: T) => ReactNode;
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  onRowSelect,
  actions,
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
  }, [data]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((item) => String(item[keyField])));
    }
    setSelectAll(!selectAll);
    if (onRowSelect) {
      onRowSelect(selectAll ? [] : data.map((item) => String(item[keyField])));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelectedRows);
    if (onRowSelect) {
      onRowSelect(newSelectedRows);
    }
  };

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    if (typeof column.accessor === "function") {
      return column.accessor(item);
    }
    return item[column.accessor] as ReactNode;
  };

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="border-b border-gray-200">
            <tr>
              {onRowSelect && (
                <th className="h-10 px-4 py-4 text-left text-md text-muted-foreground font-normal">
                  <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                </th>
              )}
              {columns.map((column, index) => (
                <th key={index} className="px-4 py-4 text-left text-md text-muted-foreground font-normal">
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-4 text-left text-md text-muted-foreground font-normal">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={String(item[keyField])}>
                  {onRowSelect && (
                    <td className="p-4">
                      <Checkbox
                        checked={selectedRows.includes(String(item[keyField]))}
                        onCheckedChange={() => handleSelectRow(String(item[keyField]))}
                      />
                    </td>
                  )}
                  {columns.map((column, index) => (
                    <td key={index} className="p-4 text-gray-800">
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-4">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (onRowSelect ? 1 : 0) + (actions ? 1 : 0)}
                  className="p-4 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="text-sm text-gray-600">
            {pagination.totalItems > 0 ? 
              `${(pagination.currentPage - 1) * pagination.itemsPerPage + 1} - ${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of ${pagination.totalItems} rows` 
              : "0 rows"}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!pagination.hasPrevPage} 
                onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
                className="px-3 py-1 h-8"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Previous</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
                className="px-3 py-1 h-8"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}