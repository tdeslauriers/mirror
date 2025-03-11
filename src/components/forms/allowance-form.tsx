"use client";

import { Allowance, AllowanceActionCmd } from "@/app/allowances";
import { useActionState } from "react";
import style from "./allowance-form.module.css";
import FormSubmit from "./form-submit";

export default function AllowanceForm({
  csrf,
  slug,
  allowance,
  allowanceFormUpdate,
}: {
  csrf: string;
  slug: string | null;
  allowance: Allowance | null;
  allowanceFormUpdate: (
    prevState: AllowanceActionCmd,
    formData: FormData
  ) => AllowanceActionCmd | Promise<AllowanceActionCmd>;
}) {
  const [allowanceState, formAction] = useActionState(allowanceFormUpdate, {
    csrf: csrf,
    slug: slug,
    allowance: allowance,
    errors: {},
  });

  console.log(allowanceState);

  return (
    <form className="form" action={formAction}>
      <div className={style.row}>
        <div className={style.left}>
          <h2>
            Balance:{" "}
            <span className="highlight">
              {allowanceState.allowance?.balance}
            </span>
          </h2>
        </div>
        <div className={style.right}>
          Last Updated:{" "}
          <span className="highlight">
            {allowanceState.allowance?.updated_at
              ? new Date(
                  allowanceState.allowance.updated_at
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Never"}
          </span>
        </div>
      </div>

      <hr style={{ marginBottom: "2rem" }} />
      <div className={style.row}>
        <div className={style.left}>
          <label className="label" htmlFor="credit">
            Credit
          </label>
          <input
            className={`${style.account}`}
            type="number"
            title="input a number to add to the balance"
            name="credit"
            min={0}
            placeholder="add $..."
          />
        </div>

        <div className={style.right}>
          <label className="label" htmlFor="debit">
            Debit
          </label>
          <input
            className={`${style.account}`}
            type="number"
            title="Input a number to subtract from the balance"
            name="debit"
            min={0}
            max={allowanceState.allowance?.balance}
            placeholder="subtract $..."
          />
        </div>
      </div>

      <div className={`row ${style.checkbox}`}>
        <div className={"field"}>
          <label className="label" htmlFor="is_archived">
            Archived
          </label>
          <input
            className="form"
            name="is_archived"
            type="checkbox"
            defaultChecked={allowanceState.allowance?.is_archived}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="is_active">
            Active
          </label>
          <input
            className="form"
            name="is_active"
            type="checkbox"
            defaultChecked={allowanceState.allowance?.is_active}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="is_calculated">
            Calculated
          </label>
          <input
            className="form"
            name="is_calculated"
            type="checkbox"
            defaultChecked={allowanceState.allowance?.is_calculated}
          />
        </div>
      </div>
      <div className="row">
        <FormSubmit
          buttonLabel="Update Allowance"
          pendingLabel="Updating Alowance"
        />
      </div>
    </form>
  );
}
