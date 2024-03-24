import logo from "../../assets/logo.png";
import styles from "./Logo.module.css";

export default function Logo({ style }) {
  return (
    <div
      className={styles.logo}
      style={style ? style : {}}
    >
      <img src={logo} alt="easycut logo" />
    </div>
  );
}
