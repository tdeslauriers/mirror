import styles from "./error-field.module.css";

export default function ErrorField({
  errorMsg,
}: Readonly<{
  errorMsg: string;
}>): React.ReactElement {
  return (
    <div className={styles.error}>
      <span className={styles.highlightError}>
        <strong>{errorMsg}</strong>
      </span>
    </div>
  );
}
