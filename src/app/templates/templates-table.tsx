"use client";

import { Suspense, useState } from "react";
import { TaskCadence, cadenceTitle, TaskTemplate } from ".";
import { access } from "fs";
import Table, { TableColumn } from "@/components/table";
import Link from "next/link";
import { AllowanceUser } from "@/components/forms";

interface TemplatesTableProps {
  data: TaskTemplate[];
}

export default function TemplatesTable({ data }: TemplatesTableProps) {
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
                  title={`see all of ${assignee.firstname}'s tasks`}
                  style={
                    index < (value as AllowanceUser[]).length - 1
                      ? { marginBottom: "0.5rem" }
                      : { marginBottom: "0" }
                  }
                >
                  <Link
                    className="locallink no-hover"
                    href={`/users/${assignee.slug}`}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {assignee.firstname} {assignee.lastname}
                  </Link>
                  <sup>
                    <span className="highlight">*</span>
                  </sup>
                </li>
              ))}
            </ul>
          ) : (
            <span className="highlight-error no-hover">Unassigned</span>
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
          filterKeys={[
            "name",
            "description",
            "category",
            "cadence",
            "is_archived",
          ]}
          pageSize={10}
        />
      </Suspense>
    </div>
  );
}
