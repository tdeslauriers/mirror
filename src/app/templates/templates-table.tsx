"use client";

import { Suspense, useState } from "react";
import { cadenceTitle, TaskTemplate } from ".";
import Table, { TableColumn } from "@/components/table";
import Link from "next/link";
import { AllowanceUser } from "@/components/forms";

interface TemplatesTableProps {
  data: TaskTemplate[];
  username?: string | null;
  accountVisibility?: boolean;
}

export default function TemplatesTable({
  data,
  username,
  accountVisibility,
}: TemplatesTableProps) {
  const [search, setSearch] = useState("");

  const columns: TableColumn<TaskTemplate>[] = [
    {
      header: "Task",
      accessor: "name" as keyof TaskTemplate,
      sortable: true,
      render: (value: TaskTemplate[keyof TaskTemplate], row: TaskTemplate) => (
        <Link className="locallink no-hover" href={`/templates/${row.slug}`}>
          {value as string}
        </Link>
      ),
    },
    {
      header: "Description",
      accessor: "description" as keyof TaskTemplate,
      sortable: true,
    },
    {
      header: "Category",
      accessor: "category" as keyof TaskTemplate,
      sortable: true,
    },
    {
      header: "Cadence",
      accessor: "cadence" as keyof TaskTemplate,
      sortable: true,
      render: (value: TaskTemplate[keyof TaskTemplate]) => (
        <div title={cadenceTitle(value as string)}>
          <span>{value as string}</span>
          <sup>
            <span className="highlight">*</span>
          </sup>
        </div>
      ),
    },
    {
      header: "Calculated?",
      accessor: "is_calculated" as keyof TaskTemplate,
      sortable: false,
      render: (value: TaskTemplate[keyof TaskTemplate]) => (
        <span
          className={
            value === true
              ? "highlight"
              : "highlight-disabled no-hover-disabled"
          }
          aria-label={value ? "Calculated" : "Not Calculated"}
        >
          {value ? "💲" : "❌"}
        </span>
      ),
    },
    {
      header: "Archived?",
      accessor: "is_archived" as keyof TaskTemplate,
      sortable: false,
      render: (value: TaskTemplate[keyof TaskTemplate]) => (
        <span
          className={
            value === true
              ? "highlight-disabled no-hover-disabled"
              : "highlight"
          }
          aria-label={value ? "Archived" : "Active"}
        >
          {value ? "📦" : "Active"}
        </span>
      ),
    },

    {
      header: "Assignees",
      accessor: "assignees" as keyof TaskTemplate,
      sortable: false,
      render: (value: TaskTemplate[keyof TaskTemplate]) => (
        <>
          {value ? (
            <ul style={{ listStyleType: "none" }}>
              {(value as AllowanceUser[]).map((assignee, index) => (
                <li
                  key={assignee.username}
                  title={
                    accountVisibility || assignee.username === username
                      ? `see ${assignee.firstname}'s allowance`
                      : `not authorized to see ${assignee.firstname}'s allowance`
                  }
                  style={
                    index < (value as AllowanceUser[]).length - 1
                      ? { marginBottom: "0.5rem" }
                      : { marginBottom: "0" }
                  }
                >
                  {accountVisibility || assignee.username === username ? (
                    <Link
                      className="locallink no-hover"
                      href={`/allowances/${assignee.allowance_slug}`}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {assignee.firstname} {assignee.lastname}
                    </Link>
                  ) : (
                    <span className="highlight-disabled no-hover-disabled">
                      {assignee.firstname} {assignee.lastname}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <span className="highlight-error no-hover-error">Unassigned</span>
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
          filterKeys={["name", "description", "category", "cadence"]}
          pageSize={10}
        />
      </Suspense>
    </div>
  );
}
