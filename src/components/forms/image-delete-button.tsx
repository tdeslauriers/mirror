"use client";

import { DeleteImageActionCmd } from "@/app/images";
import { useActionState, useState } from "react";
import ErrorField from "../errors/error-field";
import Modal from "../modal";

export default function ImageDelete({
  imageDelete,
}: {
  imageDelete: (
    prevState: DeleteImageActionCmd,
    formData: FormData,
  ) => DeleteImageActionCmd | Promise<DeleteImageActionCmd>;
}) {
  const [confirming, setConfirming] = useState(false);

  const [deleteState, formAction, isPending] = useActionState(imageDelete, {
    errors: {},
  });

  // don't let the modal close mid-submit
  // us isPending instead of state
  const closeConfirm = () => {
    if (!isPending) setConfirming(false);
  };

  return (
    <>
      {/* delete button that opens the form */}
      <div className="actionsRemove">
        <button type="button" onClick={() => setConfirming(true)}>
          Delete
        </button>
      </div>

      {/* deletion modal */}
      <Modal
        isOpen={confirming}
        onClose={closeConfirm}
        labelledBy="delete-image-title"
        showClose={false}
        closeOnBackdrop={!isPending}
      >
        {/* banner */}
        <h2 id="delete-image-title" style={{ marginBottom: ".5rem" }}>
          Delete this image?
        </h2>
        <sub>*This cannot be undone.</sub>
        <hr />

        {/* server errors */}
        {deleteState.errors?.server && (
          <ErrorField errorMsgs={deleteState.errors.server} />
        )}

        {/* deletion form */}
        <form action={formAction}>
          {/* cancel button */}

          <div className="row actions">
            <button
              style={{ width: "100%" }}
              type="button"
              autoFocus
              onClick={closeConfirm}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>

          {/* send delete command */}
          <div className="row actionsRemove">
            <button type="submit" disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
