import { Form, Badge, Button, Flex, Input, Space, Row, Col } from "antd";
import { CloseSquareFilled } from "@ant-design/icons";
import { useState } from "react";
import { numberFormatToString } from "../../utils/numberFormat";
import { decimalPrecision } from "../../consts";

const isNumeric = (input) => /^[-+.,]?\d*[.,]?\d*$/.test(input);

export const StaticParamElement = ({
  paramName,
  isOverrided,
  paramID,
  paramValue,
  onChange,
  onDelete,
  noDelete,
}) => {
  const [isValid, setValid] = useState(true);

  const onInputChange = (e) => {
    let newValue = e.target.value;

    if (newValue.includes(",")) newValue = newValue.replace(",", ".");

    const isInputValid = isNumeric(newValue);

    if (isInputValid) {
      onChange(paramName, newValue);
    }

    setValid(isInputValid);

    if (!isInputValid) {
      setTimeout(() => {
        setValid(true);
      }, 500);
    }
  };

  return (
    <Row
      gutter={[32, 32]}
      align={"middle"}
      style={{ width: "60%", marginBottom: 25 }}
    >
      <Col span={10}>
        <p>{paramName}</p>
      </Col>
      <Col span={14}>
        <Flex justify="center" style={{ width: "100%" }}>
          {isOverrided ? (
            <Badge dot style={{ padding: 6 }}>
              <Form.Item style={{ margin: 0 }}>
                <Input
                  placeholder={paramName + " value"}
                  className={isValid ? "" : "error-field"}
                  value={paramValue}
                  onChange={onInputChange}
                />
              </Form.Item>
            </Badge>
          ) : (
            <Form.Item style={{ margin: 0 }}>
              <Input
                placeholder={paramName + " value"}
                className={isValid ? "" : "error-field"}
                value={paramValue}
                onChange={onInputChange}
              />
            </Form.Item>
          )}

          {!noDelete && (
            <Button
              icon={<CloseSquareFilled style={{ fontSize: 24 }} />}
              type="link"
              onClick={() => onDelete(paramID)}
              danger
            />
          )}
        </Flex>
      </Col>
    </Row>
  );
};
