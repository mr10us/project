import { v4 as uuidv4 } from "uuid";

export const conditionsObjToArr = (conditionsObj) => {
  if (conditionsObj === undefined)
    return [{ key: "default", condition: "default", formula: "" }];
  const resultArr = conditionsObj
    ? Object.entries(conditionsObj).map(([condition, formula]) => ({
        condition: condition,
        formula: formula,
        key: condition === "default" ? condition : uuidv4(),
      }))
    : null;

  return resultArr;
};
