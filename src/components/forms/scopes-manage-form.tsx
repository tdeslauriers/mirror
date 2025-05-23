"use client";

import { useActionState, useState } from "react";
import { Scope, EntityScopesActionCmd } from ".";
import styles from "./scopes-manage-form.module.css";
import Link from "next/link";
import FormSubmit from "./form-submit";
import ErrorField from "../errors/error-field";

export default function ScopesManageForm({
  csrf,
  editAllowed,
  slug,
  entityScopes: entityScopes,
  menuScopes: menuScopes,
  updateScopes,
}: {
  csrf?: string | null;
  editAllowed?: boolean; // just cookie check => ui rendering logic only
  slug?: string | null;
  entityScopes: Scope[] | null;
  menuScopes: Scope[];
  updateScopes: (
    previousState: EntityScopesActionCmd,
    formData: FormData
  ) => EntityScopesActionCmd | Promise<EntityScopesActionCmd>;
}) {
  const [currentScopes, setCurrentScopes] = useState<Scope[] | null>(
    entityScopes
  );
  const [selectedScopeName, setSelectedScopeName] = useState("");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedScopeName(e.target.value);
  };

  const addScope = (slug: string | undefined) => {
    const scope = menuScopes.find((s) => s.slug === slug);
    if (currentScopes && currentScopes.length > 0) {
      const exists = currentScopes.find((s) => s.slug === slug);
      if (scope && !exists) {
        setCurrentScopes([...currentScopes, scope]);
      }
    } else {
      if (scope) {
        setCurrentScopes([scope]);
      }
    }
    setSelectedScopeName("");
  };

  const removeScope = (slug: string | undefined) => {
    if (!slug) return;
    if (!currentScopes) return;
    setCurrentScopes(currentScopes.filter((s) => s.slug !== slug));
  };

  const [entityScopesState, formAction] = useActionState(updateScopes, {
    csrf: csrf,
    slug: slug,
    // entityScopes not needed because scopes are coming from useState currentScopes variable
    errors: {},
  });

  return (
    <>
      <form className="form" action={formAction}>
        {entityScopesState.errors.server && (
          <ErrorField errorMsgs={entityScopesState.errors.server} />
        )}

        {editAllowed && (
          <>
            <label>add scope</label>
            <div className={styles.row}>
              <div className={styles.box}>
                <select
                  name="scope-select"
                  className={styles.select}
                  value={selectedScopeName}
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
                    onClick={() => addScope(selectedScopeName)}
                  >
                    Add scope
                  </button>
                </div>
              </div>
            </div>
            <sub style={{ fontSize: ".75rem" }}>
              * A scope may only be added once below.
            </sub>
            <hr style={{ marginTop: "2rem" }} />
          </>
        )}

        {(!currentScopes || currentScopes.length < 1) && (
          <>
            <div className={styles.scopecard}>
              <span className="highlight-info">No scopes assigned.</span>
            </div>
          </>
        )}

        {currentScopes &&
          currentScopes.map((scope) => (
            <div key={scope.slug} className={styles.scopecard}>
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
                  <h3>
                    <span className="highlight">{scope.service_name}</span>
                  </h3>
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
                <div className={styles.box} style={{}}>
                  {scope.description}
                </div>
                <div className={`${styles.box} ${styles.right}`}>
                  <div
                    style={{ width: "auto", alignItems: "right" }}
                    className={`actions  ${styles.right}`}
                  >
                    <button
                      type="button"
                      onClick={() => removeScope(scope.slug)}
                      disabled={!editAllowed}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <input type="hidden" name="scopes[]" value={scope.slug} />
            </div>
          ))}

        {editAllowed && (
          <div className={`row`}>
            <FormSubmit
              buttonLabel="Update Scopes"
              pendingLabel="updating assigned scopes..."
            />
          </div>
        )}
      </form>
    </>
  );
}
