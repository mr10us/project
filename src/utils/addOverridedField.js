export const addOverridedField = (firstArray, secondArray) => {
  const resultArray = [...firstArray];

  resultArray.forEach((item, index) => {
    const correspondingItem = secondArray.find((secondItem) => secondItem.id === item.id);

    if (correspondingItem && correspondingItem.value !== item.value) {
      resultArray[index] = { ...item, overrided: true };
    }
  });

  return resultArray;
};
