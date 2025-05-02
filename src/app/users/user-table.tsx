"use client";

import Table, { TableColumn } from "@/components/table";
import Link from "next/link";
import { useState } from "react";

interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  slug: string;
  created_at: string;
  enabled: boolean;
  account_expired: boolean;
  account_locked: boolean;
}

interface UserTableProps {
  data: User[];
}

export default function UserTable({ data }: UserTableProps) {
  const [search, setSearch] = useState("");

  // set up columns for table
  const columns: TableColumn<User>[] = [
    {
      header: "Username",
      accessor: "username" as keyof User,
      sortable: true,
      render: (value: User[keyof User], row: User) => (
        <Link className="locallink no-hover" href={`/users/${row.slug}`}>
          {value}
        </Link>
      ),
    },
    {
      header: "Firstname",
      accessor: "firstname" as keyof User,
      sortable: true,
    },
    {
      header: "Lastname",
      accessor: "lastname" as keyof User,
      sortable: true,
    },
    {
      header: "Created At",
      accessor: "created_at" as keyof User,
      sortable: true,
      render: (value: User[keyof User], row: User) => (
        <>{(value as string).split("T")[0]}</>
      ),
    },
    {
      header: "Enabled?",
      accessor: "enabled" as keyof User,
      sortable: false,
      render: (value: User[keyof User]) => (
        <>
          {value ? (
            <span className="highlight" aria-label="enabled">
              ✔️
            </span>
          ) : (
            <span className="highlight-error no-hover" aria-label="disabled">
              ❌
            </span>
          )}
        </>
      ),
    },
    {
      header: "Expired?",
      accessor: "account_expired" as keyof User,
      sortable: false,
      render: (value: User[keyof User]) => (
        <>
          {value ? (
            <span
              className="highlight-disabled no-hover-disabled"
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
      header: "Locked",
      accessor: "account_locked" as keyof User,
      sortable: false,
      render: (value: User[keyof User]) => (
        <>
          {value ? (
            <span
              className="highlight-error no-hover-error"
              aria-label="locked"
            >
              🔒
            </span>
          ) : (
            <span className="highlight" aria-label="unlocked">
              🔓
            </span>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="table-wrapper">
      {/* Search bar */}
      <input
        type="text"
        className="table-search"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {/* Table component */}
      <Table<User>
        data={data}
        columns={columns}
        search={search}
        filterKeys={[
          "username",
          "firstname",
          "lastname",
          "created_at",
          "enabled",
          "account_expired",
          "account_locked",
        ]}
        pageSize={10}
      />
    </div>
  );
}
