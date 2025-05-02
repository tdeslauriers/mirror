"use client";

import Link from "next/link";
import { Task } from ".";
import style from "./task_card.module.css";
import { useState, useTransition } from "react";
import { updateTaskStatusAction } from "./actions";
import ErrorField from "@/components/errors/error-field";

export default function TaskCard({
  task,
  csrf,
}: {
  task: Task;
  csrf?: string | null;
}) {
  const [isPendingComplete, startTransitionComplete] = useTransition();
  const [isPendingSatisfactory, startTransitionSatisfactory] = useTransition();
  const [isPendingProactive, startTransitionProactive] = useTransition();

  // statuses
  const [isComplete, setIsComplete] = useState(task.is_complete);
  const [isSatisfactory, setIsSatisfacotry] = useState(task.is_satisfactory);
  const [isProactive, setIsProactive] = useState(task.is_proactive);

  // error
  const [statusError, setStatusError] = useState<string | null>(null);

  // update statues
  const handleStatusUpdate = (status: string) => {
    // clear old errors
    setStatusError(null);

    // handle update of any status
    switch (status) {
      case "is_complete":
        const optimisticIsComplete = !isComplete;
        setIsComplete(optimisticIsComplete);

        startTransitionComplete(() => {
          updateTaskStatusAction(
            task.task_slug as string,
            csrf as string,
            "is_complete"
          )
            .then((response) => {
              if (response?.confirmed !== optimisticIsComplete) {
                setIsComplete(response?.confirmed); // ensure synced with server
              }
            })
            .catch((err) => {
              setIsComplete(!optimisticIsComplete); // rollback optimistic update

              const message =
                err instanceof Error
                  ? err.message
                  : "Unknown error occured when trying to update is_complete status.";
              setStatusError(message);
            });
        });
        break;
      case "is_satisfactory":
        const optimisticIsSatisfactory = !isSatisfactory;
        setIsSatisfacotry(optimisticIsSatisfactory);
        startTransitionSatisfactory(() => {
          updateTaskStatusAction(
            task.task_slug as string,
            csrf as string,
            "is_satisfactory"
          )
            .then((response) => {
              if (response?.confirmed !== optimisticIsSatisfactory) {
                setIsSatisfacotry(response?.confirmed); // ensure synced with server
              }
            })
            .catch((err) => {
              setIsSatisfacotry(!optimisticIsSatisfactory); // rollback optimistic update
              const message =
                err instanceof Error
                  ? err.message
                  : "Unknown error occured when trying to update is_satisfactory status.";
              setStatusError(message);
            });
        });
        break;
      case "is_proactive":
        const optimisticIsProactive = !isProactive;
        setIsProactive(optimisticIsProactive);
        startTransitionProactive(() => {
          updateTaskStatusAction(
            task.task_slug as string,
            csrf as string,
            "is_proactive"
          )
            .then((response) => {
              if (response?.confirmed !== optimisticIsProactive) {
                setIsProactive(response?.confirmed); // ensure synced with server
              }
            })
            .catch((err) => {
              setIsProactive(!optimisticIsProactive); // rollback optimistic update
              const message =
                err instanceof Error
                  ? err.message
                  : "Unknown error occured when trying to update is_proactive status.";
              setStatusError(message);
            });
        });
        break;
      default:
        setStatusError(
          "Unknown status type. You many only update is_complete, is_satisfactory, or is_proactive."
        );
        break;
    }
  };
  return (
    <div className={style.taskcard}>
      <div className={`${style.row} ${style.title}`}>
        <div className={`${style.box}`}>
          <h3>
            <span className="highlight">{task.name}</span>
          </h3>
        </div>
        <div className={`${style.box} ${style.right}`}>
          <Link
            className="locallink"
            href={`/allowances/${task.allowance_slug}`}
          >
            {task.assignee?.firstname} {task.assignee?.lastname}
          </Link>
        </div>
      </div>

      <div className={style.row}>
        <div>{task.description}</div>
      </div>

      <div className={`${style.row} ${style.metadata}`}>
        <div>
          <b>Created: </b>
          <span className="highlight">
            {new Date(task.created_at as string).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div>
          <b>Cadence: </b>
          <span className="highlight">{task.cadence}</span>
        </div>
        <div>
          <b>Category:</b> <span className="highlight">{task.category}</span>
        </div>
      </div>

      <hr />

      <div className={`${style.row}`}>
        <div
          className={`${isComplete ? "actions" : "actionsError"} ${
            style.status
          }`}
        >
          <button
            name="is_complete"
            type="button"
            value={isComplete ? "true" : "false"}
            onClick={() => handleStatusUpdate("is_complete")}
            disabled={isPendingComplete}
          >
            {isComplete ? "Complete" : "Incomplete"}
          </button>
        </div>
        <div
          className={`${isSatisfactory ? "actions" : "actionsError"}  ${
            style.status
          }`}
        >
          <button
            name="is_satisfactory"
            type="button"
            value={isSatisfactory ? "true" : "false"}
            onClick={() => handleStatusUpdate("is_satisfactory")}
            disabled={isPendingSatisfactory}
          >
            {isSatisfactory ? "Satisfactory" : "Deficient"}
          </button>
        </div>
        <div
          className={`${isProactive ? "actions" : "actionsError"}  ${
            style.status
          }`}
        >
          <button
            name="is_proactive"
            type="button"
            value={isProactive ? "true" : "false"}
            onClick={() => handleStatusUpdate("is_proactive")}
            disabled={isPendingProactive}
          >
            {isProactive ? "Proactive" : "Reminded"}
          </button>
        </div>
      </div>
      <sub>
        <em>* Click on a button to flip the status.</em>
      </sub>

      {statusError && (
        <div className={style.row}>
          <ErrorField errorMsgs={[statusError]} />
        </div>
      )}
    </div>
  );
}
