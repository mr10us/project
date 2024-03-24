import { getUniqueParams } from "./getUniqueParams";
import React from "react";
import { Badge } from "antd";

const getParamType = (type) => {
  switch (type) {
    case 1:
      return "green";
    case 2:
      return "red";
    case 3:
      return "blue";
    default:
      null;
  }
};

const getBadgedTitle = (title, type) => {
  if (type) {
    const titleElement = React.createElement("p", { children: title });
    const typeBadge = React.createElement(Badge, {
      color: type,
      dot: true,
      children: titleElement,
    });
    return typeBadge;
  }
  return React.createElement("p", { children: title });
};

export const parseToColumns = (
  data,
  lang,
  fixedCols,
  visible,
  width,
  statistics
) => {
  const fixedColumns = fixedCols.map(({ name, title, width }) => ({
    title: title,
    dataIndex: name,
    key: name,
    fixed: "left",
    width: 60,
    
  }));
  const tableColumns = fixedColumns;

  const allParams = data.map((machine) => machine.parameters).flat();

  const uniqueParams = getUniqueParams(allParams);

  const sortedParams = sortParameters(uniqueParams);
  // const sortMeasuredToDisplayFirst = () => {
  //   const calculatedParams = statistics.filter((param) => {
  //     return sortedParams.some(
  //       (sortedParam) =>
  //         sortedParam.id === param.id && sortedParam.type === "calculated"
  //     );
  //   });

  //   // Находим все остальные объекты в массиве statistics
  //   const otherParams = statistics.filter((param) => {
  //     return !sortedParams.some(
  //       (sortedParam) =>
  //         sortedParam.id === param.id && sortedParam.type === "calculated"
  //     );
  //   });

  //   // Возвращаем объединенный массив, где параметры типа 'calculated' находятся в начале
  //   return [...calculatedParams, ...otherParams];
  // };
  // console.log(sortMeasuredToDisplayFirst())

  const dynamicColumns = sortedParams
    .map((item) => {
      if (item.type === "static" && visible === false) return null;
      else {
        const paramName = item.parameter.name[lang] || item.parameter.name.en;
        let title = `${paramName}, ${item.parameter.variable_name}`;

        if (width < 565) title = item.parameter.variable_name;

        // For parametrized Titles
        // const type = getParamType(item.parameter.type);
        // const badgedTitle = getBadgedTitle(title, type);
        return {
          title: title,
          dataIndex: item.parameter.id,
          key: item.parameter.id,
          align: "center",
          width: 120,
        };
      }
    })
    .filter(Boolean);
  return [...tableColumns, ...dynamicColumns];
};

export const sortParameters = (parameters) =>
  parameters.sort((a, b) => {
    const order = { measured: 1, calculated: 2, static: 3 };

    return order[a.type] - order[b.type];
  });
