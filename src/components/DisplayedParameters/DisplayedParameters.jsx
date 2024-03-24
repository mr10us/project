import React, { useMemo, useState } from "react";
import { Flex } from "antd";
import { PageHeader } from "../PageHeader/PageHeader";
import { CustomEmpty } from "../UI/CustomEmpty";
import { colors } from "../../consts";
import { useSelector } from "react-redux";
import { selectCurrentLang } from "../../features/CurrentLang/currentLang";
import { DisplayedParameter } from "../DisplayedParameter/DisplayedParameter";
import {
  DndContext,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { CustomerSettingsModal } from "../Modal/CustomerSettingsModal/CustomerSettingsModal";
import { getParameterName } from "../../utils/Parameters/langParamsHelper";
import { useTranslation } from 'react-i18next';

export const DisplayedParameters = ({
  readOnly,
  params,
  handleDelete,
  handleChecked,
  reorderArrayHandler,
  addParameter,
  uniqParamsArray,
}) => {
  const [open, setOpen] = useState(false);

  const openModal = () => {
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
  };

  const { t } = useTranslation();
  const buttons = [{ name: t("buttons.add.parameter"), handler: openModal }];
  const currentLang = useSelector(selectCurrentLang);

  const formatedParams = useMemo(
    () =>
      params?.map((param) => ({
        id: param.parameter.id,
        name: getParameterName(param.parameter, currentLang),
        checked: param.is_statistical,
        ordinal_number: param.ordinal_number,
      })) || [],
    [params, currentLang]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const activeIndex = params.findIndex(
        (i) => i.ordinal_number === active.id
      );
      const overIndex = params.findIndex((i) => i.ordinal_number === over?.id);

      const newOrder = arrayMove(params, activeIndex, overIndex);

      reorderArrayHandler(newOrder);
    }
  };

  return (
    <>
      <CustomerSettingsModal
        open={open}
        handleClose={closeModal}
        addParameter={addParameter}
        uniqParamsArray={uniqParamsArray}
      />

      <PageHeader
        title={t("parameters.displayed.name")}
        buttons={readOnly ? [] : buttons}
        size="middle"
        margin
      />
      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={params.map((param) => param.ordinal_number)}>
          <Flex style={{ width: "100%" }} wrap="wrap" gap="middle">
            {formatedParams.length > 0 ? (
              formatedParams.map((param) => (
                <DisplayedParameter
                  readOnly={readOnly}
                  key={param.id}
                  ordinalNum={param.ordinal_number}
                  paramId={param.id}
                  parameter={param.name}
                  checked={param.checked}
                  handleChecked={handleChecked}
                  handleDelete={handleDelete}
                />
              ))
            ) : (
              <CustomEmpty
                style={{
                  backgroundColor: colors.lightGray,
                  padding: "36px 0",
                  borderRadius: 12,
                  width: "100%",
                }}
              />
            )}
          </Flex>
        </SortableContext>
      </DndContext>
    </>
  );
};
