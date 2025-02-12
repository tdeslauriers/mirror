"use client";

import { useState } from "react";
import { Scope } from ".";
import styles from "./scopes-manage-form.module.css";
import Link from "next/link";

export default function ScopesManageForm({
  csrf,
  slug,
  entityScopes: entityScopes,
  menuScopes: menuScopes,
}: {
  csrf: string;
  slug: string | null;
  entityScopes: Scope[];
  menuScopes: Scope[];
}) {
  const [currentScopes, setCurrentScopes] = useState<Scope[]>(entityScopes);
  const [selectedScope, setSelectedScope] = useState("");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedScope(e.target.value);
  };

  const addScope = (slug: string | undefined) => {
    const scope = menuScopes.find((s) => s.slug === slug);
    const exists = currentScopes.find((s) => s.slug === slug);
    if (scope && !exists) {
      setCurrentScopes([...currentScopes, scope]);
    }
    setSelectedScope("");
  };

  const removeScope = (slug: string | undefined) => {
    setCurrentScopes(currentScopes.filter((s) => s.slug !== slug));
  };

  return (
    <>
      <form className="form">
        <label>add scope</label>
        <div className={styles.row}>
          <div className={styles.box}>
            <select
              name="scope-select"
              className={styles.select}
              value={selectedScope}
              onChange={handleSelect}
            >
              <option value="">Select scope...</option>
              {menuScopes.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className={`${styles.box} ${styles.right}`}>
            <div
              style={{ width: "auto", alignItems: "right" }}
              className={`actions  ${styles.right}`}
            >
              <button
                name="add-scope"
                type="button"
                onClick={() => addScope(selectedScope)}
              >
                Add scope
              </button>
            </div>
          </div>
        </div>
        <sub style={{ fontSize: ".65rem" }}>
          A scope can only be added one time.
        </sub>
        <hr className="page-title" />

        <h3 style={{ marginTop: "2rem" }}>Current Scopes</h3>

        {currentScopes.map((scope) => (
          <>
            <div className={styles.scopecard}>
              <div className={styles.row} style={{ fontSize: "2rem" }}>
                <div className={styles.box}>
                  <Link
                    className="locallink no-hover"
                    href={`/scopes/${scope.slug}`}
                  >
                    {scope.scope}
                  </Link>
                </div>
                <div className={`${styles.box} ${styles.right}`}>
                  <span className="highlight">{scope.service_name}</span>
                </div>
              </div>
              {/* <hr className="page-title" /> */}
              <div
                className={styles.row}
                style={{ marginTop: "0.5rem", fontWeight: "bold" }}
              >
                <div className={styles.box}>{scope.name}</div>
              </div>
              <div className={styles.row}>
                <div className={styles.box}>{scope.description}</div>
                <div className={`${styles.box} ${styles.right}`}>
                  <div
                    style={{ width: "auto", alignItems: "right" }}
                    className={`actions  ${styles.right}`}
                  >
                    <button
                      type="button"
                      onClick={() => removeScope(scope.slug)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <input type="hidden" name="scopes[]" value={scope.slug} />
            </div>
          </>
        ))}
      </form>
    </>
  );
}
