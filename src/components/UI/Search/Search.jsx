import React from "react";
import { Select } from "antd";
import styles from "./Search.module.css";

export const Search = (props) => {
  function formatOptions(options) {
    const formatted = options?.map(
      (option) =>
        new Object({
          value: option?.id || option?.value,
          label: option?.label,
        })
    );
    return formatted;
  }
  const options = formatOptions(props?.options);

  const handleSelect = (value) => {
    if (props.handleSelect) props.handleSelect(value);
  };

  return (
    <>
      <Select
        disabled={props.disabled}
        showSearch
        allowClear={props.allowClear}
        placeholder={props.placeholder || "Search..."}
        optionFilterProp="label"
        onSelect={handleSelect}
        onClear={() => handleSelect(null)}
        size={props.size}
        // filterOption={(input, option) => (option?.label ?? "").includes(input)}
        // filterSort={(optionA, optionB) =>
        //   (optionA?.label ?? "")
        //     .toLowerCase()
        //     .localeCompare((optionB?.label ?? "").toLowerCase())
        // }
        style={props.style}
        options={options}
        defaultValue={props.defaultValue}
      >
        {props.children}
      </Select>
      {props.hint && <p className={styles.hint}>{props.hint}</p>}
    </>
  );
};
