"use client";

import { useActionState } from "react";
import FormSubmit from "./form-submit";
import { PatActionCmd } from "@/app/services";
import ErrorField from "../errors/error-field";
import styles from "./pat-gen-form.module.css";

export default function PatGenForm({
  csrf,
  slug,
  genPatToken,
}: {
  csrf: string | null;
  slug: string | null;
  genPatToken: (
    previousState: PatActionCmd,
    formData: FormData
  ) => PatActionCmd | Promise<PatActionCmd>;
}) {
  const [patState, formAction] = useActionState(genPatToken, {
    csrf: csrf,
    slug: slug,
    success: false,
    pat: null,
    errors: {},
  });
  return (
    <>
      <form className="form" action={formAction}>
        <div className="row">
          <ul
            className="pat-info"
            style={{
              marginBottom: "0.5rem",
              fontStyle: "italic",
              paddingLeft: "1rem",
            }}
          >
            <li>
              PATs (Personal/Service Access Tokens) allow external applications
              to interact with the{" "}
              <span className="highlight">deslauriers.world</span> gateway.
            </li>
            <li>
              External applications must be registered services before a pat
              token may be generated.
            </li>
          </ul>
        </div>

        {/* errors  */}
        {patState.errors && patState.errors.server && (
          <ErrorField errorMsgs={patState.errors.server} />
        )}
        {patState.errors && patState.errors.csrf && (
          <div className="row" style={{ marginBottom: "1rem" }}>
            <ErrorField errorMsgs={patState.errors.csrf} />
          </div>
        )}

        {/* success message */}
        {patState.success && patState.pat && (
          <div className="row" style={{ marginBottom: "1rem" }}>
            <div className={styles.pat}>
              <h2>
                Token: <span className="highlight">{patState.pat}</span>
              </h2>
              <p className="pat-info" style={{ fontStyle: "italic" }}>
                <span className="highlight-info">
                  *Please copy and save this token now. It will not be shown
                  again.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* hidden fields */}
        <div className="row" style={{ marginTop: "1.5rem" }}>
          <FormSubmit
            buttonLabel="generate token"
            pendingLabel="generating token..."
          />
        </div>
      </form>
    </>
  );
}
