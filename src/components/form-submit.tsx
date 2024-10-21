"use client";

import { useFormStatus } from "react-dom";
import styles from "./form-submit.module.css";

interface FormSubmitProps {
  buttonLabel: string;
  pendingLabel?: string;
  [key: string]: any;
}

export default function FormSubmit({
  buttonLabel,
  pendingLabel,
  ...props
}: FormSubmitProps) {
  const status = useFormStatus();
  const pending = pendingLabel || "processing...";

  return (
    <>
      <div className={styles.actions}>
        <button type="submit" disabled={status.pending}>
          {status.pending ? pending.toUpperCase() : buttonLabel.toUpperCase()}
        </button>
      </div>
    </>
  );
}
