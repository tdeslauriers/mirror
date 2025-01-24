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
  const sortedData = useMemo(() => {
    // no sorting
    if (!sortConfig) {
      return filteredData;
    }

    // sort
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // handle null/undefined values
      if (aValue == null || bValue == null) {
        return aValue == null ? 1 : -1;
      }

      // string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue, undefined, { sensitivity: "base" })
          : bValue.localeCompare(aValue, undefined, { sensitivity: "base" });
      }

      // number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // TODO: date comparison
      // for now, dates are treated as strings and as long as in iso format, they will sort correctly

      return 0; // default case
    });
    return sorted;
  }, [filteredData, sortConfig]);

  // pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (currentPage > totalPages || totalPages === 0) {
      setCurrentPage(1);
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

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
          <tr className="no-hover">
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                className={column.sortable ? "sortable" : ""}
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
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          {totalPages === 0
            ? `Page 0 of 0`
            : `Page ${currentPage} of ${totalPages}`}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </>
  );
}
