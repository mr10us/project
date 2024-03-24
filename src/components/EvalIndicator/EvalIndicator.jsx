import styles from "./EvalIndicator.module.css";

export const EvalIndicator = ({ value, evaluation }) => {
  if (evaluation)
    return (
      <span
        className={styles[`indicator_${evaluation}`] + " " + styles.indicator}
      >
        {value}
      </span>
    );

  return <span className={styles.indicator}>{value}</span>;
};
