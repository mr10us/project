import styles from "./DoubleSide.module.css"

export default function DoubleSide({children}) {
  return (
    <div className={styles.doubleSide}>{children}</div>
  )
}