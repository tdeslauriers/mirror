"use client";

import { useActionState } from "react";
import style from "./allowance-form.module.css";
import FormSubmit from "./form-submit";
import ErrorField from "../errors/error-field";
import { convertCentsToDollars } from "@/app/allowances";
import { Allowance, AllowanceActionCmd } from ".";

export default function AllowanceForm({
  csrf,
  slug,
  credit,
  debit,
  allowance,
  allowanceFormUpdate,
}: {
  csrf: string;
  slug: string | null;
  credit?: number;
  debit?: number;
  allowance: Allowance | null;
  allowanceFormUpdate: (
    prevState: AllowanceActionCmd,
    formData: FormData
  ) => AllowanceActionCmd | Promise<AllowanceActionCmd>;
}) {
  const [allowanceState, formAction] = useActionState(allowanceFormUpdate, {
    csrf: csrf,
    slug: slug,
    credit: credit,
    debit: debit,
    allowance: allowance,
    errors: {},
  });

  return (
    <form className="form" action={formAction}>
      <div className={style.row}>
        <div className={style.left}>
          <h2>
            Balance:{" "}
            <span className="highlight">
              {allowanceState.allowance?.balance
                ? convertCentsToDollars(allowanceState.allowance?.balance)
                : 0}
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

      {allowanceState.errors.server && (
        <ErrorField errorMsgs={allowanceState.errors.server} />
      )}

      <div className={style.row}>
        <div className={style.left}>
          <label className="label" htmlFor="credit">
            Credit{" "}
            <sup>
              <span
                className={
                  isDisabled(allowanceState.allowance)
                    ? "highlight-error"
                    : "highlight"
                }
                style={{ fontSize: ".65rem" }}
              >
                add to balance
              </span>
            </sup>
          </label>
          {allowanceState.errors.credit && (
            <ErrorField errorMsgs={allowanceState.errors.credit} />
          )}
          <input
            className={`${
              isDisabled(allowanceState.allowance)
                ? style.disabled
                : style.account
            }`}
            type="number"
            step="0.01"
            title="Input a number to add to the balance"
            name="credit"
            min={0}
            max={10000}
            defaultValue={allowanceState?.credit || 0}
            disabled={isDisabled(allowanceState.allowance)}
          />
        </div>

        <div className={style.right}>
          <label className="label" htmlFor="debit">
            Debit{" "}
            <sup>
              <span
                className={
                  isDisabled(allowanceState.allowance)
                    ? "highlight-error"
                    : "highlight"
                }
                style={{ fontSize: ".65rem" }}
              >
                {allowanceState.allowance?.balance
                  ? `subtract from balance`
                  : `balance is zero`}
              </span>
            </sup>
          </label>
          {allowanceState.errors.debit && (
            <ErrorField errorMsgs={allowanceState.errors.debit} />
          )}
          <input
            className={`${
              isDisabled(allowanceState.allowance)
                ? style.disabled
                : style.account
            }`}
            type="number"
            step="0.01"
            title="Input a number to subtract from the balance"
            name="debit"
            min={0}
            max={
              allowanceState.allowance?.balance
                ? convertCentsToDollars(allowanceState.allowance?.balance) >
                  10000
                  ? 10000
                  : convertCentsToDollars(allowanceState.allowance?.balance)
                : 0
            }
            defaultValue={allowanceState?.debit || 0}
            disabled={isDisabled(allowanceState.allowance)}
          />
        </div>
      </div>

      <div className={`row ${style.checkbox}`}>
        <div className={"field"}>
          <label className="label" htmlFor="is_archived">
            Archived
          </label>
          {allowanceState.errors.is_archived && (
            <div style={{ marginRight: "1rem" }}>
              {" "}
              <ErrorField errorMsgs={allowanceState.errors.is_archived} />
            </div>
          )}
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
          {allowanceState.errors.is_active && (
            <div style={{ marginRight: "1rem" }}>
              <ErrorField errorMsgs={allowanceState.errors.is_active} />
            </div>
          )}
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
          {allowanceState.errors.is_calculated && (
            <div style={{ marginRight: "1rem" }}>
              <ErrorField errorMsgs={allowanceState.errors.is_calculated} />
            </div>
          )}
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

function isDisabled(allowance: Allowance | undefined | null) {
  if (!allowance) {
    return true;
  }
  if (!allowance.balance) {
    return false;
  }
  if (allowance.is_archived) {
    return true;
  }
  if (!allowance.is_active) {
    return true;
  }
  if (!allowance.is_calculated) {
    return true;
  }
  return false;
}
