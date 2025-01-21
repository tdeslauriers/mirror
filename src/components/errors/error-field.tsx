import styles from "./error-field.module.css";

export default function ErrorField({
  errorMsgs,
}: Readonly<{
  errorMsgs: string[];
}>): React.ReactElement {
  return (
    <div className={styles.error}>
      <ul>
        {errorMsgs.length > 0
          ? errorMsgs.map((e: string, i: number) => (
              <li className={styles.listError} key={`err_${i}`}>
                <span className={styles.highlightError}>
                  <strong>{e}</strong>
                </span>
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}
