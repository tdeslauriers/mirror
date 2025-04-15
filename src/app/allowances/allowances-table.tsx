"use client";

import { Suspense, useState } from "react";
import Table, { TableColumn } from "@/components/table";
import Link from "next/link";
import Loading from "@/components/loading";
import { Allowance } from "@/components/forms";
import { convertCentsToDollars } from ".";

interface AllowanceTableProps {
  data: Allowance[];
}

export default function AllowancesTable({ data }: AllowanceTableProps) {
  const [search, setSearch] = useState("");

  const columns: TableColumn<Allowance>[] = [
    {
      header: "Account/Remittee",
      accessor: "username" as keyof Allowance,
      sortable: true,
      render: (value: Allowance[keyof Allowance], row: Allowance) => (
        <Link className="locallink no-hover" href={`/allowances/${row.slug}`}>
          {value}
        </Link>
      ),
    },
    {
      header: "Balance",
      accessor: "balance" as keyof Allowance,
      sortable: true,
      render: (value: Allowance[keyof Allowance], row: Allowance) => (
        <span className="highlight">
          {convertCentsToDollars(value as number)}
        </span>
      ),
    },
    {
      header: "Created At",
      accessor: "created_at" as keyof Allowance,
      sortable: true,
      render: (value: Allowance[keyof Allowance], row: Allowance) => (
        <>{(value as string).split("T")[0]}</>
      ),
    },
    {
      header: "Updated At",
      accessor: "updated_at" as keyof Allowance,
      sortable: true,
      render: (value: Allowance[keyof Allowance], row: Allowance) => (
        <>{(value as string).split("T")[0]}</>
      ),
    },
    {
      header: "Archived",
      accessor: "is_archived" as keyof Allowance,
      sortable: false,
      render: (value: Allowance[keyof Allowance]) => (
        <>
          {value ? (
            <span className="highlight-error no-hover">Archived</span>
          ) : (
            <span>Unarchived</span>
          )}
        </>
      ),
    },
    {
      header: "Active",
      accessor: "is_active" as keyof Allowance,
      sortable: false,
      render: (value: Allowance[keyof Allowance]) => (
        <>
          {value ? (
            <span>Active</span>
          ) : (
            <span className="highlight-error no-hover">Inactive</span>
          )}
        </>
      ),
    },
    {
      header: "Calculated",
      accessor: "is_calculated" as keyof Allowance,
      sortable: false,
      render: (value: Allowance[keyof Allowance]) => (
        <>
          {value ? (
            <span>Calculated</span>
          ) : (
            <span className="highlight-error no-hover">Not Calculated</span>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="table-wrapper">
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Suspense
        fallback={
          <div>
            <Loading />
          </div>
        }
      >
        <Table
          columns={columns}
          data={data}
          search={search}
          filterKeys={["username", "balance", "created_at", "updated_at"]}
        />
      </Suspense>
    </div>
  );
}
