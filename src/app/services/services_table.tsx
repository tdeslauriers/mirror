"use client";

import { ServiceClient } from "@/components/forms";
import Table, { TableColumn } from "@/components/table";
import Link from "next/link";
import { Suspense, useState } from "react";

interface ServicesTableProps {
  data: ServiceClient[];
}

export default function ServicesTable({ data }: ServicesTableProps) {
  const [search, setSearch] = useState("");

  // set up columns for table
  const columns: TableColumn<ServiceClient>[] = [
    {
      header: "Service Name",
      accessor: "name" as keyof ServiceClient,
      sortable: true,
      render: (
        value: ServiceClient[keyof ServiceClient],
        row: ServiceClient
      ) => (
        <Link className="locallink no-hover" href={`/services/${row.slug}`}>
          {value as string}
        </Link>
      ),
    },
    {
      header: "Owner",
      accessor: "owner" as keyof ServiceClient,
      sortable: true,
    },
    {
      header: "Created At",
      accessor: "created_at" as keyof ServiceClient,
      sortable: true,
      render: (
        value: ServiceClient[keyof ServiceClient],
        row: ServiceClient
      ) => <>{(value as string).split("T")[0]}</>,
    },
    {
      header: "Enabled?",
      accessor: "enabled" as keyof ServiceClient,
      sortable: false,
      render: (value: ServiceClient[keyof ServiceClient]) => (
        <>
          {value ? (
            <span className="highlight" aria-label="enabled">
              ✔️
            </span>
          ) : (
            <span
              className="highlight-error no-hover-error"
              aria-label="disabled"
            >
              ❌
            </span>
          )}
        </>
      ),
    },
    {
      header: "Expired?",
      accessor: "account_expired" as keyof ServiceClient,
      sortable: false,
      render: (value: ServiceClient[keyof ServiceClient]) => (
        <>
          {value ? (
            <span
              className="highlight-error no-hover-disabled"
              aria-label="expired"
            >
              Expired
            </span>
          ) : (
            <span className="highlight" aria-label="active">
              Active
            </span>
          )}
        </>
      ),
    },
    {
      header: "Locked?",
      accessor: "account_locked" as keyof ServiceClient,
      sortable: false,
      render: (value: ServiceClient[keyof ServiceClient]) => (
        <>
          {value ? (
            <span
              className="highlight-error no-hover-error"
              aria-label="locked"
            >
              🔒
            </span>
          ) : (
            <span className="highlight" aria-label="Unlocked">
              🔓
            </span>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="table-wrapper">
      <input
        className="search"
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <Table
          data={data}
          columns={columns}
          search={search}
          filterKeys={["name", "owner"]}
          pageSize={10}
        />
      </Suspense>
    </div>
  );
}
