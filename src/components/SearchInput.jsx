import { LoadingOutlined } from "@ant-design/icons";
import { Flex, Input } from "antd";
import _debounce from "lodash/debounce";
import { useState } from "react";

export const SearchInput = ({
  placeholder,
  style,
  setQuery,
  hint,
}) => {
  const [inputValue, setInputValue] = useState("");

  const debouncedSearch = _debounce((value) => {
    if (!value) setQuery("");
    else setQuery(`search=${value}`);
  }, 500);

  const handleInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);

    debouncedSearch(value);
  };

  return (
    <Flex vertical>
      <Input
        style={{
          maxWidth: 400,
          minWidth: 150,
          marginBottom: hint ? 0 : 40,
          ...style,
        }}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
      />
      {hint ? <p className="hint">{hint}</p> : null}
    </Flex>
  );
};
