import Link from "next/link";

export default async function TemplatesPage() {
  return (
    <>
      <main className="main main-drawer">
        <div className="center"></div>
        <div className="page-title">
          <div
            className="actions"
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "1rem",
            }}
          >
            <h1>Task Templates</h1>
            <Link href="/templates/add">
              <button>Add Task Template</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />
      </main>
    </>
  );
}
