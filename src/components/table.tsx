"use client";

import { ReactNode, useMemo, useState } from "react";

type SortDirection = "asc" | "desc" | null;

export interface TableColumn<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onSort?: (key: keyof T, direction: SortDirection) => void;
  search?: string; // search string
  filterKeys?: (keyof T)[]; // keys to filter on, ie, columns in scope for filtering)
  pageSize?: number; // number of rows per page
}

// Table component
export default function Table<T>({
  data,
  columns,
  onSort,
  search = "",
  filterKeys,
  pageSize = 10,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: SortDirection;
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  // filtering
  const filteredData = useMemo(() => {
    if (!search || !filterKeys || filterKeys.length === 0) {
      return data;
    }
    const searchLower = search.toLowerCase();
    return data.filter((row) =>
      filterKeys.some((key) =>
        String(row[key]).toLowerCase().includes(searchLower)
      )
    );
  }, [data, search, filterKeys]);

  // sorting
  const sortedDated = useMemo(() => {
    if (!sortConfig) {
      return filteredData;
    }
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : 1;
      }
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  // pagination
  const totalPages = Math.ceil(sortedDated.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedDated.slice(startIndex, endIndex);
  }, [sortedDated, currentPage, pageSize]);

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      const newDirection: "asc" | "desc" | null =
        prev && prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      const newConfig = { key, direction: newDirection };
      setSortConfig(newConfig);
      if (onSort) {
        onSort(key, newDirection);
      }
      return newConfig;
    });
  };

  return (
    <>
      {/* Table */}
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                onClick={() => column.sortable && handleSort(column.accessor)}
              >
                {column.header}
                {column.sortable && sortConfig?.key === column.accessor && (
                  <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={String(column.accessor)}>
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : String(row[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
}
