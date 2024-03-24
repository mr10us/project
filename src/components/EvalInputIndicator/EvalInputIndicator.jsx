import React, { useState } from "react";
import { Input } from "antd";
import styles from "./EvalInputIndicator.module.css";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

const isNumeric = (input) => /^[-+.,]?\d*[.,]?\d*$/.test(input);

export const EvalInputIndicator = ({
  value,
  evaluation,
  placeholder,
  onChange,
}) => {
  const [isValid, setValid] = useState(true);

  const { width } = useGetCurrentSize();

  const handleInputChange = (newValue) => {
    newValue = newValue.replace(",", ".");
    
    const isInputValid = isNumeric(newValue);

    if (isInputValid) {
      onChange(newValue);
    }

    setValid(isInputValid);

    if (!isInputValid) {
      setTimeout(() => {
        setValid(true);
      }, 500);
    }
  };

  const inputClassName = isValid
    ? styles.indicator
    : `${styles.indicator} error-field`;

  return (
    <Input
      className={
        evaluation
          ? `${styles[`indicator_${evaluation}`]} ${inputClassName}`
          : inputClassName
      }
      value={value}
      style={{width: width < 465 ? 60 : 100}}
      onChange={(e) => handleInputChange(e.target.value)}
      placeholder={placeholder}
      inputMode="decimal"
    />
  );
};
