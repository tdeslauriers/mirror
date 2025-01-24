"use client";

import Table, { TableColumn } from "@/components/table";
import Link from "next/link";
import { Suspense, useState } from "react";

interface Scope {
  scope_id: string;
  service_name: string;
  scope: string;
  name: string;
  description: string;
  created_at: string;
  active: boolean;
  slug: string;
}

interface ScopesTableProps {
  data: Scope[];
}

export default function ScopesTable({ data }: ScopesTableProps) {
  const [search, setSearch] = useState("");

  // set up columns for table
  const columns: TableColumn<Scope>[] = [
    {
      header: "Scope",
      accessor: "scope" as keyof Scope,
      sortable: true,
      render: (value: Scope[keyof Scope], row: Scope) => (
        <Link className="locallink no-hover" href={`/scopes/${row.slug}`}>
          {value}
        </Link>
      ),
    },
    {
      header: "Scope Name",
      accessor: "name" as keyof Scope,
      sortable: true,
    },
    {
      header: "Service Name",
      accessor: "service_name" as keyof Scope,
      sortable: true,
    },
    {
      header: "Description",
      accessor: "description" as keyof Scope,
      sortable: false,
    },
    {
      header: "Created At",
      accessor: "created_at" as keyof Scope,
      sortable: true,
      render: (value: Scope[keyof Scope], row: Scope) => (
        <>{(value as string).split(" ")[0]}</>
      ),
    },
    {
      header: "Active",
      accessor: "active" as keyof Scope,
      sortable: false,
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
      <Suspense fallback={<div>Loading...</div>}>
        <Table
          data={data}
          columns={columns}
          search={search}
          filterKeys={["scope", "service_name", "name", "description"]}
          pageSize={10}
        />
      </Suspense>
    </div>
  );
}
