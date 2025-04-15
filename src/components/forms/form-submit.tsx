"use client";

import { useFormStatus } from "react-dom";

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
      <div className={`actions`}>
        <button type="submit" disabled={status.pending }>
          <strong>
            {status.pending ? pending.toUpperCase() : buttonLabel.toUpperCase()}
          </strong>
        </button>
      </div>
    </>
  );
}
