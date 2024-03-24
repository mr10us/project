import { Button, Card, Checkbox, Flex, Space } from "antd";
import { CloseSquareFilled } from "@ant-design/icons";
import styles from "./DisplayedParameter.module.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from 'react-i18next';

export const DisplayedParameter = ({
  readOnly,
  parameter,
  ordinalNum,
  paramId,
  checked,
  handleDelete,
  handleChecked,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ordinalNum,
  });
  const style = {
    transform: CSS.Transform.toString(
      transform && {
        ...transform,
        scaleY: 1,
      }
    ),
    transition,
    cursor: "grab",
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 9999,
        }
      : {}),
  };

  const { t } = useTranslation();

  const handleChange = (event) => {
    handleChecked(paramId, event.target.checked);
  };

  return (
    <Card
      ref={setNodeRef}
      className={styles.card}
      style={{ ...style, minHeight: 200, minWidth: 200, touchAction: "none" }}
      {...attributes}
      {...listeners}
    >
      {readOnly ? null : (
        <Button
          style={{ position: "absolute", top: 5, right: 5 }}
          icon={<CloseSquareFilled />}
          danger
          type="link"
          onClick={() => handleDelete(paramId)}
        />
      )}
      <Flex vertical justify="space-between" gap="middle">
        <h2 className={styles.paramPos}># {ordinalNum}</h2>
        <Space direction="vertical">
          <p className={styles.defaultText}>{t("parameters.displayed.title")}</p>
          <p className={styles.parameter}>{parameter}</p>
        </Space>
        <Space size="small">
          <p className={styles.defaultText}>{t("parameters.displayed.in_statistics")}</p>
          <Checkbox checked={checked} onChange={handleChange} />
        </Space>
      </Flex>
    </Card>
  );
};
