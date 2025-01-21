"use client";

import { useMemo, useState } from "react";

type SortDirection = "asc" | "desc" | null;

interface TableColumn<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
}

export default function Table<T>({ data, columns }: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: SortDirection;
  } | null>(null);

  const sortedDated = useMemo(() => {
    if (sortConfig) {
      const sorted = [...data].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }

        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }

        return 0;
      });
      return sorted;
    }
    return data;
  }, [data, sortConfig]);

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <>
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
          {sortedDated.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={String(column.accessor)}>
                  {String(row[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
