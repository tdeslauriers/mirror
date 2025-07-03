"use client";

import { Suspense, useState } from "react";
import { Permission } from ".";
import Table, { TableColumn } from "@/components/table";
import Link from "next/link";
import Loading from "@/components/loading";

interface PermissionsTableProps {
  data: Permission[];
}

export default function PermissionsTable({ data }: PermissionsTableProps) {
  const [search, setSearch] = useState("");

  const columns: TableColumn<Permission>[] = [
    {
      header: "Permission",
      accessor: "name" as keyof Permission,
      sortable: true,
      render: (value: Permission[keyof Permission], row: Permission) => (
        <Link className="locallink no-hover" href={`/permissions/${row.slug}`}>
          {value}
        </Link>
      ),
    },
    {
      header: "Service",
      accessor: "service" as keyof Permission,
      sortable: true,
    },
    {
      header: "Description",
      accessor: "description" as keyof Permission,
      sortable: false,
    },
    {
      header: "Created At",
      accessor: "created_at" as keyof Permission,
      sortable: true,
      render: (value: Permission[keyof Permission]) => (
        <>{(value as string).split("T")[0]}</>
      ),
    },
    {
      header: "Active?",
      accessor: "active" as keyof Permission,
      sortable: false,
      render: (value: Permission[keyof Permission]) => (
        <>
          {value ? (
            <span className="highlight no-hover">✔️</span>
          ) : (
            <span className="highlight-disabled no-hover-disabled">❌</span>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="table-wrapper">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
      />
      <Suspense
        fallback={
          <div>
            <Loading />
          </div>
        }
      >
        <Table
          data={data}
          columns={columns}
          search={search}
          filterKeys={["name", "service", "description"]}
          pageSize={10}
        />
      </Suspense>
    </div>
  );
}
