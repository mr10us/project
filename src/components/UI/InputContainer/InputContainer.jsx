import { Row, Col } from "antd";

export const InputContainer = ({ rows, rowsItems }) => {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <Row key={i} gutter={[24, 24]}>
          {rowsItems.map((item, index) => (
            <Col key={index} span={12}>{item}</Col>
          ))}
        </Row>
      ))}
    </div>
  );
};
