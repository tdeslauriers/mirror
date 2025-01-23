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
        <Link href={`/users/${row.slug}`}>{value}</Link>
      ),
    },
    {
      header: "Firstname",
      accessor: "firstname" as keyof User,
      sortable: true,
      render: (value: User[keyof User], row: User) => (
        <Link href={`/users/${row.slug}`}>{value}</Link>
      ),
    },
    {
      header: "Lastname",
      accessor: "lastname" as keyof User,
      sortable: true,
      render: (value: User[keyof User], row: User) => (
        <Link href={`/users/${row.slug}`}>{value}</Link>
      ),
    },
    {
      header: "Created At",
      accessor: "created_at" as keyof User,
      sortable: true,
      render: (value: User[keyof User], row: User) => (
        <Link href={`/users/${row.slug}`}>
          {(value as string).split("T")[0]}
        </Link>
      ),
    },
    {
      header: "Enabled",
      accessor: "enabled" as keyof User,
      sortable: false,
      render: (value: User[keyof User], row: User) => (
        <Link href={`/users/${row.slug}`}>
          {value ? "Enabled" : "Disabled"}
        </Link>
      ),
    },
    {
      header: "Account Expired",
      accessor: "account_expired" as keyof User,
      sortable: false,
      render: (value: User[keyof User], row: User) => (
        <Link href={`/users/${row.slug}`}>{value ? "Expired" : "Active"}</Link>
      ),
    },
    {
      header: "Account Locked",
      accessor: "account_locked" as keyof User,
      sortable: false,
      render: (value: User[keyof User], row: User) => (
        <Link href={`/users/${row.slug}`}>{value ? "Locked" : "Unlocked"}</Link>
      ),
    },
  ];

  return (
    <>
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {/* Table component */}
      <Table<User>
        data={data}
        columns={columns}
        search={search}
        filterKeys={["username", "firstname", "lastname", "created_at"]}
        pageSize={10}
      />
    </>
  );
}
